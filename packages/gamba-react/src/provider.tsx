import { ConnectionContext, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import { Connection, ConnectionConfig, PublicKey } from '@solana/web3.js'
import { GambaProvider } from 'gamba-core'
import { createContext, useEffect, useMemo } from 'react'
import { useGamba } from './hooks'

type GambaProviderProps = {
  creator?: PublicKey | string
  connection?: {
    endpoint: string
    config?: ConnectionConfig
  }
}

type GambaProviderContext = {
  provider: GambaProvider,
}

export const GambaProviderContext = createContext<GambaProviderContext>({ provider: null! })

// todo
function WalletSideEffects() {
  const wallet = useWallet()
  const gamba = useGamba()

  useEffect(() => {
    wallet.connected && wallet.wallet && gamba.connect(wallet.wallet)
  }, [wallet.connected])

  return null
}

export function Gamba({ children, connection: connectionProps, creator }: React.PropsWithChildren<GambaProviderProps>) {
  const endpoint = connectionProps?.endpoint ?? ''
  const connectionParams: ConnectionConfig = {
    commitment: 'processed',
    ...connectionProps?.config,
  }
  const connection = useMemo(() => new Connection(endpoint, connectionParams), [endpoint, connectionParams])

  const provider = useMemo(() => {
    const _creator = typeof creator === 'string' ? new PublicKey(creator) : undefined
    return new GambaProvider(connection, _creator)
  }, [connection, creator])

  useEffect(() => provider.listen(), [provider])

  return (
    <ConnectionContext.Provider value={{ connection }}>
      <WalletProvider autoConnect wallets={[]}>
        <GambaProviderContext.Provider value={{ provider }}>
          <WalletSideEffects />
          {children}
        </GambaProviderContext.Provider>
      </WalletProvider>
    </ConnectionContext.Provider>
  )
}
