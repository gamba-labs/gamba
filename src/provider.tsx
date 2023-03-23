import { ConnectionProviderProps, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { Buffer } from 'buffer'
import { useEffect, useRef, useState } from 'react'
import { AnchorProvider, useAnchorProgram } from './AnchorProvider'
import { SolanaProvider } from './SolanaProvider'
import { useGambaStore } from './store'
import { GambaConfigInput, User, SettledGameEvent } from './types'
import { getPdaAddress, getRecentGames, parseEvent, parseUserAccount } from './utils'

export type GambaProviderProps = GambaConfigInput & {
  children: any
}

const HOUSE_SEED = [Buffer.from('house')]
const USER_SEED = (owner: PublicKey) => [Buffer.from('user'), owner.toBuffer()]

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
          .sort((a, b) => b.blockTime - a.blockTime)
          .slice(0, 20),
    }))

  useEffect(() => {
    getRecentGames(connection)
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
        const user = await getPdaAddress(...USER_SEED(owner))
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

  const previousUser = useRef<User>()
  /**
   * Game state change listener
   */
  const handleUserAccount = async (account: AccountInfo<Buffer> | null) => {
    const user = parseUserAccount(account)
    console.debug('🍤 Game Account changed', account?.lamports, user)
    eventEmitter.emitUserAccountChanged(user, previousUser.current)
    set({ user })
    previousUser.current = user
  }

  useEffect(() => {
    if (accounts.user) {
      connection.getAccountInfo(accounts.user).then(handleUserAccount)
      const listener = connection.onAccountChange(accounts.user, (account) => {
        handleUserAccount(account)
      })
      return () => {
        connection.removeAccountChangeListener(listener)
      }
    }
  }, [wallet, accounts.user])

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
