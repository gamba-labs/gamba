import { ConnectionContext, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Connection, ConnectionConfig, PublicKey } from '@solana/web3.js'
import { GambaProvider as GambaProviderCore } from 'gamba-core'
import { createContext, useEffect, useMemo } from 'react'
import { useGamba, useSessionStore } from './hooks'
import { randomSeed } from './utils'

type GambaProviderProps = {
  creator?: PublicKey | string
  connection?: {
    endpoint: string
    config?: ConnectionConfig
  }
}

type GambaProviderContext = {
  provider: GambaProviderCore
}

export const GambaProviderContext = createContext<GambaProviderContext>({ provider: null! })

/**
 * Automatically connects / disconnects web3 wallet to Gamba
 * Also updates client seed when nonce advances
 */
function SideEffects() {
  const { wallet, connected } = useWallet()
  const gamba = useGamba()
  const set = useSessionStore((state) => state.set)

  useEffect(() => {
    set({ seed: randomSeed() })
  }, [gamba.user?.nonce])

  useEffect(() => {
    if (wallet && connected) {
      gamba.connect(wallet)
    }
    if (!connected && gamba.session?._wallet) {
      gamba.disconnect()
    }
  }, [wallet, connected])

  return null
}

/**
 *
 */
export function GambaProvider({ children, creator }: React.PropsWithChildren<{ creator?: PublicKey | string }>) {
  const { connection } = useConnection()

  const provider = useMemo(() => {
    const _creator = typeof creator === 'undefined' ? undefined : new PublicKey(creator)
    return new GambaProviderCore(connection, _creator)
  }, [connection, creator])

  useEffect(() => provider.listen(), [provider])

  return (
    <GambaProviderContext.Provider value={{ provider }}>
      <SideEffects />
      {children}
    </GambaProviderContext.Provider>
  )
}

/**
 * GambaProvider with ConnectionProvider and WalletProvider
 */
export function Gamba({ children, connection: connectionProps, creator }: React.PropsWithChildren<GambaProviderProps>) {
  const endpoint = connectionProps?.endpoint ?? ''
  const connectionParams: ConnectionConfig = {
    commitment: 'processed',
    ...connectionProps?.config,
  }
  const connection = useMemo(() => new Connection(endpoint, connectionParams), [endpoint, connectionParams])

  return (
    <ConnectionContext.Provider value={{ connection }}>
      <WalletProvider autoConnect wallets={[]}>
        <GambaProvider creator={creator}>
          {children}
        </GambaProvider>
      </WalletProvider>
    </ConnectionContext.Provider>
  )
}
