import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import { GambaProvider } from 'gamba-core-v2'

const root = ReactDOM.createRoot(document.getElementById('root')!)

function Root() {
  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [],
  )

  const endpoint = "https://worried-chiquia-fast-devnet.helius-rpc.com/"
  const endpoint_mainnet = "https://exciting-georgena-fast-mainnet.helius-rpc.com/"

  return (
    <HashRouter>
      <ConnectionProvider
        endpoint={endpoint}
        config={{ commitment: 'processed' }}
      >
        <WalletProvider autoConnect wallets={wallets}>
          <WalletModalProvider>
            <App />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </HashRouter>
  )
}

root.render(<Root />)
