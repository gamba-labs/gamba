import { BorshCoder, EventParser } from '@coral-xyz/anchor'
import { ConnectionProviderProps, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Buffer } from 'buffer'
import { useEffect, useState } from 'react'
import { AnchorProvider, useAnchorProgram } from './AnchorProvider'
import { GambaConfigInput } from './config'
import { useFetchState, useGambaResult } from './hooks'
import { SolanaProvider } from './SolanaProvider'
import { useGambaStore } from './store'
import { GameResult } from './types'
import { getEnum } from './utils'

export type GambaProps = {
  children: any
} & GambaConfigInput

const parseEvent = (name: string, e: any, blockTime: number): GameResult | undefined => {
  try {
    return {
      player: e.player,
      nonce: e.nonce.toNumber(),
      payout: e.unit.toNumber() * e.betMultiplier.toNumber(),
      amount: e.unit.toNumber() * 1000,
      multiplier: e.betMultiplier.toNumber(),
      resultIndex: e.resultIndex.toNumber(),
      blockTime,
    }
  } catch (err) {
    console.warn('🍤 Failed to parse event', name, e, blockTime)
    return undefined
  }
}

export function GambaProvider({ children, ...configInput }: GambaProps) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const fetchState = useFetchState()
  const [ready, setReady] = useState(false)
  const set = useGambaStore((state) => state.set)
  const programId = useGambaStore((state) => state.program)
  const program = useAnchorProgram()
  const game = useGambaStore((state) => state.game)
  const player = useGambaStore((state) => state.player)
  const playRequested = useGambaStore((state) => state.playRequested)
  const eventEmitter = useGambaStore((state) => state.eventEmitter)

  const getRecentBets = async () => {
    const eventParser = new EventParser(programId, new BorshCoder(program.idl))
    console.debug('🍤 Get recent bets')
    const signatures = await connection.getSignaturesForAddress(programId, {}, 'confirmed')
    console.debug('🍤 Recent signatures', signatures)
    const transactions = await connection.getParsedTransactions(signatures.slice(0, 10).map((x) => x.signature), 'confirmed')
    console.debug('🍤 Recent transactions', transactions)
    return new Promise<any[]>((resolve) => {
      const _events = []
      for (const tx of transactions) {
        if (tx?.meta?.logMessages) {
          const events = eventParser.parseLogs(tx.meta.logMessages)
          for (const event of events) {
            _events.push({event, blockTime: tx.blockTime ? tx.blockTime * 1000 : Date.now()})
          }
        }
      }
      resolve(
        _events
          .map(({event, blockTime}) => parseEvent(event.name, event.data, blockTime))
          .filter((x) => !!x)
      )
    })
  }
  useEffect(() => {
    getRecentBets()
      .then((x) => set((s) => ({recentBets: [...s.recentBets, ...x]})))
      .catch((err) => console.error('🍤 Failed to get recent bets', err))
  }, [])

  useEffect(() => {
    const config = {
      ...configInput,
      creator: new PublicKey(configInput.creator)
    }
    set({ config })
  }, [configInput])

  useGambaResult((result) => {
    console.debug('🍤 Unset playRequested 1')
    set({ playRequested: undefined })
  })

  useEffect(() => {
    if (playRequested) {
      if (getEnum(game.state.status) === 'hashedSeedRequested') {
        console.debug('🍤 Unset playRequested 2')
        set({ playRequested: undefined })
      }
    }
  }, [game, player, playRequested])

  const getPdaAddress = async (...seeds: (Uint8Array | Buffer)[]) => {
    const [address] = await PublicKey.findProgramAddressSync(seeds, programId)
    return address
  }
  const getHouseAddress = () => getPdaAddress(Buffer.from('house'))
  const getGameAddress = (player: PublicKey) => getPdaAddress(Buffer.from('game'), player.toBuffer())

  const getAccounts = async () => {
    try {
      const house = await getHouseAddress()
      const player = wallet.publicKey
      if (player) {
        const game = await getGameAddress(player)
        set((state) => ({
          player: { ...state.player, address: player },
          game: { ...state.game, address: game },
        }))
      }
      set((state) => ({ house: { ...state.house, address: house } }))
    } catch (err) {
      console.error('🍤 Failed to get accounts', err)
    } finally {
      setReady(true)
      console.debug('🍤 Fetched accounts')
    }
  }

  useEffect(() => {
    getAccounts()
  }, [wallet])

  useEffect(() => {
    if (ready) {
      const betSettled = program.addEventListener('BetSettledEvent', (e) => {
        const gameResult = parseEvent('BetSettledEvent', e, Date.now())
        if (gameResult) {
          console.debug('🍤 GameResult', gameResult)
          eventEmitter.emitGameSettled(gameResult)
          set((store) => ({
            recentBets: [...store.recentBets, gameResult],
          }))
        }
      })

      const betStarted = program.addEventListener('BetStartedEvent', (e) => {
        console.debug('🍤 BetStarted', e)
        eventEmitter.emitGameStarted(e)
      })

      return () => {
        program.removeEventListener(betSettled)
        program.removeEventListener(betStarted)
      }
    }
  }, [ready])

  useEffect(() => {
    if (game.address) {
      fetchState()
      const listener = connection.onAccountChange(game.address, (stuff) => {
        console.debug('🍤 Account changed', stuff)
        fetchState()
      })
      return () => {
        connection.removeAccountChangeListener(listener)
      }
    }
  }, [wallet, game.address])

  useEffect(() => {
    if (player.address) {
      const updateBalance = (balance: number) => set((store) => ({ player: { ...store.player, balance } }))
      connection.getBalance(player.address).then(updateBalance)
      const listener = connection.onAccountChange(player.address, (account) => {
        updateBalance(account.lamports)
        console.debug('🍤 Player account changed', account)
      })
      return () => {
        connection.removeAccountChangeListener(listener)
      }
    }
  }, [player.address])

  return !ready ? null : children
}

export function Gamba({children, connection, ...configInput}: GambaProps & {connection?: Omit<ConnectionProviderProps, 'children'>}) {
  return (
    <SolanaProvider connection={connection}>
      <AnchorProvider>
        <GambaProvider {...configInput}>
          {children}
        </GambaProvider>
      </AnchorProvider>
    </SolanaProvider>
  )
}
