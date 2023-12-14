import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { GambaProvider as GambaProviderCore } from 'gamba-core-v2'
import React from 'react'

export interface GambaContext {
  provider: GambaProviderCore
}

export const GambaContext = React.createContext<GambaContext>(null!)

export function useGambaContext() {
  const context = React.useContext(GambaContext)
  if (!context) throw new Error('No GambaContext')
  return context
}

export function GambaProvider(props: React.PropsWithChildren) {
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
    () => new GambaProviderCore(
      connection,
      wallet as any,
    ),
    [connection, wallet],
  )

  return (
    <GambaContext.Provider value={{ provider }}>
      {props.children}
    </GambaContext.Provider>
  )
}
