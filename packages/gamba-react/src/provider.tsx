import { ConnectionContext, WalletProvider, WalletProviderProps, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Connection, ConnectionConfig, PublicKey } from '@solana/web3.js'
import { GambaClient } from 'gamba-core'
import React from 'react'
import { useGamba } from './hooks'
import { randomSeed } from './utils'

interface GambaProviderProps {
  creator?: PublicKey | string
}

interface ConnectionProps {
  wallet?: Omit<WalletProviderProps, 'children'>
  connection?: {
    endpoint: string
    config?: ConnectionConfig
  }
}

interface GambaProviderContext {
  creator?: PublicKey | string
  client: GambaClient
  seed: string
  setSeed: (seed: string) => void
}

export const GambaProviderContext = React.createContext<GambaProviderContext>(null!)

/**
 * Automatically connects / disconnects web3 wallet to Gamba
 * Also updates client seed when nonce advances
 */
function SideEffects() {
  // const { wallet, connected } = useWallet()
  const gamba = useGamba()

  React.useEffect(() => {
    gamba.updateSeed()
  }, [gamba.user?.nonce])

  return null
}

/**
 *
 */
export function GambaProvider({ children, creator }: React.PropsWithChildren<GambaProviderProps>) {
  const [seed, setSeed] = React.useState(randomSeed())
  const { connection } = useConnection()
  const { wallet, connected } = useWallet()

  const client = React.useMemo(
    () => {
      const _wallet = (() => {
        if (connected && wallet?.adapter?.publicKey)
          return wallet?.adapter as any
      })()
      return new GambaClient(connection, _wallet)
    }
    , [connection, wallet, connected],
  )

  return (
    <GambaProviderContext.Provider value={{ creator, client, seed, setSeed }}>
      <SideEffects />
      {children}
    </GambaProviderContext.Provider>
  )
}

/**
 * GambaProvider with ConnectionProvider and WalletProvider
 */
export function Gamba({ children, connection: connectionProps, wallet, ...rest }: React.PropsWithChildren<GambaProviderProps & ConnectionProps>) {
  const endpoint = connectionProps?.endpoint ?? ''
  const connectionParams: ConnectionConfig = {
    commitment: 'processed',
    ...connectionProps?.config,
  }
  const connection = React.useMemo(() => new Connection(endpoint, connectionParams), [endpoint, connectionParams])

  return (
    <ConnectionContext.Provider value={{ connection }}>
      <WalletProvider autoConnect wallets={[]} {...wallet}>
        <GambaProvider {...rest}>
          {children}
        </GambaProvider>
      </WalletProvider>
    </ConnectionContext.Provider>
  )
}
