import { ConnectionProviderProps, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { AnchorProvider, useAnchorProgram } from './AnchorProvider'
import { SolanaProvider } from './SolanaProvider'
import { HOUSE_SEED, USER_SEED } from './constants'
import { useAccountChangeListener } from './hooks'
import { useGambaStore } from './store'
import { GambaConfigInput } from './types'
import { getPdaAddress, getRecentGames, parseEvent, parseHouseAccount, parseUserAccount } from './utils'

export type GambaProviderProps = GambaConfigInput & {
  children: any
}

export function GambaProvider({ children, ...configInput }: GambaProviderProps) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [ready, setReady] = useState(false)
  const set = useGambaStore((state) => state.set)
  const program = useAnchorProgram()
  const accounts = useGambaStore((state) => state.accounts)
  const eventEmitter = useGambaStore((state) => state.eventEmitter)
  const addRecentGames = useGambaStore((state) => state.addRecentGames)

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
      const house = await getPdaAddress(HOUSE_SEED)
      const owner = wallet.publicKey
      if (owner) {
        const user = await getPdaAddress(USER_SEED, owner.toBuffer())
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

  /** User state change listener */
  useAccountChangeListener(accounts.user, (account, previous) => {
    const user = parseUserAccount(account)
    const previousUser = parseUserAccount(previous)
    console.debug('🍤 User Account changed', account?.lamports, user)
    eventEmitter.emitUserAccountChanged(user, previousUser)
    set({ user })
  })

  /** House state change listener */
  useAccountChangeListener(accounts.house, (account) => {
    const house = parseHouseAccount(account)
    console.debug('🍤 House Account changed', account?.lamports, house)
    set({ house })
  })

  /**
   * Player balance listener
   */
  useEffect(() => {
    const handlePlayerBalance = (balance: number) => {
      set((store) => ({ wallet: { ...store.wallet, balance } }))
    }
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
