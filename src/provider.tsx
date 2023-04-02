import { ConnectionProviderProps, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { Buffer } from 'buffer'
import { useEffect, useRef, useState } from 'react'
import { AnchorProvider, useAnchorProgram } from './AnchorProvider'
import { SolanaProvider } from './SolanaProvider'
import { useGambaStore } from './store'
import { GambaConfigInput, SettledGameEvent } from './types'
import { getPdaAddress, getRecentGames, parseEvent, parseHouseAccount, parseUserAccount } from './utils'

export type GambaProviderProps = GambaConfigInput & {
  children: any
}

const HOUSE_SEED = [Buffer.from('house')]
const getUserSeed = (owner: PublicKey) => [Buffer.from('user'), owner.toBuffer()]

function useSolanaAccountListener(
  account: PublicKey | null,
  callback: (account: AccountInfo<Buffer> | null, previous: AccountInfo<Buffer> | null) => void,
) {
  const { connection } = useConnection()
  const previous = useRef<AccountInfo<Buffer>>(null)
  const handler = (account: AccountInfo<Buffer> | null) => {
    callback(account, previous.current)
    ;(previous as any).current = account
  }
  useEffect(() => {
    if (account) {
      connection.getAccountInfo(account)
        .then(handler)
        .catch((err) => {
          console.error('🍤 Failed to getAccountInfo', err)
        })
      const listener = connection.onAccountChange(account, handler)
      return () => {
        connection.removeAccountChangeListener(listener)
      }
    }
  })
}

export function GambaProvider({ children, ...configInput }: GambaProviderProps) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [ready, setReady] = useState(false)
  const set = useGambaStore((state) => state.set)
  const program = useAnchorProgram()
  const accounts = useGambaStore((state) => state.accounts)
  const eventEmitter = useGambaStore((state) => state.eventEmitter)

  const addRecentGames = (bets: SettledGameEvent[]) =>
    set((s) => ({
      recentGames:
        [...s.recentGames, ...bets]
          .filter(
            (a, i, arr) => {
              const key = (game: SettledGameEvent) => game.player.toBase58() + '-' + game.nonce
              return arr.findIndex((b) => key(b) === key(a)) === i
            },
          )
          .sort((a, b) => b.estimatedTime - a.estimatedTime)
          .slice(0, 100),
    }))

  useEffect(() => {
    getRecentGames(connection, configInput.recentGamesFetchLimit ?? 20)
      .then(addRecentGames)
      .catch((err) => console.error('🍤 Failed to get recent bets', err))
  }, [])

  useEffect(() => {
    set({
      config: {
        ...configInput,
        creator: new PublicKey(configInput.creator),
      },
    })
  }, [configInput])

  const getAccounts = async () => {
    try {
      const house = await getPdaAddress(...HOUSE_SEED)
      const owner = wallet.publicKey
      if (owner) {
        const user = await getPdaAddress(...getUserSeed(owner))
        set((state) => ({
          accounts: {
            ...state.accounts,
            wallet: owner,
            user,
          },
        }))
      }
      set((state) => ({
        accounts: {
          ...state.accounts,
          house,
        },
      }))
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

  /**
   * Program event listener
   */
  useEffect(() => {
    if (ready) {
      const betSettled = program.addEventListener('BetSettledEvent', (e) => {
        const gameResult = parseEvent('BetSettledEvent', e, Date.now())
        if (gameResult) {
          console.debug('🍤 GameResult', gameResult)
          eventEmitter.emitGameSettled(gameResult)
          addRecentGames([gameResult])
        }
      })
      return () => {
        program.removeEventListener(betSettled)
      }
    }
  }, [ready])

  /** Game state change listener */
  useSolanaAccountListener(accounts.user, (account, previous) => {
    const user = parseUserAccount(account)
    const previousUser = parseUserAccount(previous)
    console.debug('🍤 User Account changed', account?.lamports, user)
    eventEmitter.emitUserAccountChanged(user, previousUser)
    set({ user })
  })

  /** Game state change listener */
  useSolanaAccountListener(accounts.house, (account) => {
    const house = parseHouseAccount(account)
    console.debug('🍤 House Account changed', account?.lamports, house)
    set({ house })
  })

  /**
   * Player balance listener
   */
  const handlePlayerBalance = (balance: number) => {
    set((store) => ({ wallet: { ...store.wallet, balance } }))
  }
  useEffect(() => {
    if (accounts.wallet) {
      connection.getBalance(accounts.wallet).then(handlePlayerBalance)
      const listener = connection.onAccountChange(accounts.wallet, (account) => {
        console.debug('🍤 Player account changed', account)
        handlePlayerBalance(account.lamports)
      })
      return () => {
        connection.removeAccountChangeListener(listener)
      }
    }
  }, [accounts.wallet])

  return !ready ? null : children
}

export function Gamba({ children, connection, ...configInput }: GambaProviderProps & {connection?: Omit<ConnectionProviderProps, 'children'>}) {
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
