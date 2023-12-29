import "@radix-ui/themes/styles.css"
import "@solana/wallet-adapter-react-ui/styles.css"
import "./styles.css"

import * as Toast from "@radix-ui/react-toast"
import { Theme } from "@radix-ui/themes"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import { GambaProvider } from "gamba-react-v2"
import React from "react"
import ReactDOM from "react-dom/client"
import { HashRouter } from "react-router-dom"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { App } from "./App"

const root = ReactDOM.createRoot(document.getElementById("root")!)

interface RpcThingyStore {
  endpoint: string
  set: (endpoint: string) => void
}

export const useRpcThingy = create(
  persist<RpcThingyStore>(
    set => ({
      endpoint: clusterApiUrl(),
      set: endpoint => set({ endpoint }),
    }),
    {
      name: "rpc",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)

function Root() {
  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [],
  )

  return (
    <Theme accentColor="iris" radius="large" panelBackground="translucent">
      <HashRouter>
        <ConnectionProvider endpoint={import.meta.env.VITE_RPC_ENDPOINT} config={{ commitment: "processed" }}>
          <WalletProvider autoConnect wallets={wallets}>
            <WalletModalProvider>
              <GambaProvider>
                <Toast.Provider swipeDirection="right">
                  <App />
                </Toast.Provider>
              </GambaProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </HashRouter>
    </Theme>
  )
}

root.render(<Root />)
