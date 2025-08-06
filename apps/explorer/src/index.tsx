import "@radix-ui/themes/styles.css"
import "@solana/wallet-adapter-react-ui/styles.css"
import "./styles.css"

import * as Toast from "@radix-ui/react-toast"
import { Theme } from "@radix-ui/themes"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { GambaProvider } from "gamba-react-v2"
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { App } from "./App"

const root = ReactDOM.createRoot(document.getElementById("root")!)

function Root() {
  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [],
  )
  
  console.log("Using RPC endpoint:", import.meta.env.VITE_RPC_ENDPOINT)
  return (
    <Theme accentColor="iris" radius="large" panelBackground="translucent">
      <BrowserRouter>
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
      </BrowserRouter>
    </Theme>
  )
}

root.render(<Root />)
