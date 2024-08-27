import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { GambaProvider as GambaProviderCore } from 'gamba-core-v2'
import React, { useMemo, useState } from 'react'
import { GambaPlugin } from './plugins'

export interface GambaContext {
  provider: GambaProviderCore
  plugins: GambaPlugin[]
  addPlugin: (plugin: GambaPlugin) => void
}

export interface GambaProviderProps {
  plugins?: GambaPlugin[]
  /** @deprecated use "plugins" */
  __experimental_plugins?: any[]
}

export const GambaContext = React.createContext<GambaContext>({
  provider: null!,
  plugins: [],
  addPlugin: () => null!,
})

export function useGambaContext() {
  const context = React.useContext(GambaContext)
  if (!context) throw new Error('No GambaContext')
  return context
}

export function GambaProvider({ plugins: _plugins = [], children }: React.PropsWithChildren<GambaProviderProps>) {
  const [plugins, setPlugins] = useState<GambaPlugin[]>(_plugins)
  const { connection } = useConnection()
  const walletContext = useWallet()

  const wallet = useMemo(
    () => {
      if (walletContext.connected && walletContext.wallet?.adapter?.publicKey) {
        return walletContext.wallet.adapter
      }
    },
    [walletContext],
  )

  const provider = useMemo(
    () => {
      return new GambaProviderCore(
        connection,
        wallet as any,
      )
    },
    [connection, wallet],
  )

  const addPlugin = (plugin: GambaPlugin) => {
    setPlugins((plugins) => [...plugins, plugin])
    return () => {
      setPlugins(
        (plugins) => plugins.filter((p) => p !== plugin),
      )
    }
  }

  return (
    <GambaContext.Provider value={{
      provider,
      plugins,
      addPlugin,
    }}>
      {children}
    </GambaContext.Provider>
  )
}
