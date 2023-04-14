import { ConnectionContext, WalletProvider } from '@solana/wallet-adapter-react'
import { Connection, ConnectionConfig, PublicKey } from '@solana/web3.js'
import { GambaProvider } from 'gamba-core'
import { createContext, useEffect, useMemo } from 'react'

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

export function Gamba({ children, connection: connectionProps, creator }: React.PropsWithChildren<GambaProviderProps>) {
  const endpoint = connectionProps?.endpoint ?? ''
  const connection = useMemo(() => new Connection(endpoint, connectionProps?.config), [endpoint, connectionProps])
  const provider = useMemo(() => {
    const _creator = typeof creator === 'string' ? new PublicKey(creator) : undefined
    return new GambaProvider(connection, _creator)
  }, [connection, creator])

  useEffect(() => provider.listen(), [provider])

  return (
    <ConnectionContext.Provider value={{ connection }}>
      <WalletProvider autoConnect wallets={[]}>
        <GambaProviderContext.Provider value={{ provider }}>
          {children}
        </GambaProviderContext.Provider>
      </WalletProvider>
    </ConnectionContext.Provider>
  )
}
