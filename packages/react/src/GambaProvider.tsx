import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { GambaProvider as GambaProviderCore } from 'gamba-core-v2'
import React from 'react'
import { GambaPlugin } from './plugins'

export interface GambaContext {
  provider: GambaProviderCore
  plugins: GambaPlugin[]
}

export interface GambaProviderProps {
  __experimental_plugins?: GambaPlugin[]
}

export const GambaContext = React.createContext<GambaContext>({
  provider: null!,
  plugins: [],
})

export function useGambaContext() {
  const context = React.useContext(GambaContext)
  if (!context) throw new Error('No GambaContext')
  return context
}

export function GambaProvider({ __experimental_plugins = [], children }: React.PropsWithChildren<GambaProviderProps>) {
  const { connection } = useConnection()
  const walletContext = useWallet()

  const wallet = React.useMemo(
    () => {
      if (walletContext.connected && walletContext.wallet?.adapter?.publicKey) {
        return walletContext.wallet.adapter
      }
    },
    [walletContext],
  )

  const provider = React.useMemo(
    () => {
      return new GambaProviderCore(
        connection,
        wallet as any,
      )
    },
    [connection, wallet],
  )

  return (
    <GambaContext.Provider value={{
      provider,
      plugins: __experimental_plugins,
    }}>
      {children}
    </GambaContext.Provider>
  )
}
