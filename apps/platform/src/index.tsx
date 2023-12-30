/**
 * ! Notes for devs:
 * We encourage to you change as much as possible. Layout, styling, etc..
 * This template uses components (such as buttons) from "gamba-react-ui",
 * but feel free to change that to any other component library you want.
 * However, it is recommended use the GambaUi components when creating controls for games.
 */
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { GambaPlatformProvider } from 'gamba-react-ui-v2'
import { GambaProvider } from 'gamba-react-v2'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { PLATFORM_CREATOR_ADDRESS, TOKENS } from './constants'
import { GAMES } from './games'
import './styles.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

function Root() {
  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [],
  )

  return (
    <HashRouter>
      <ConnectionProvider
        endpoint={import.meta.env.VITE_RPC_ENDPOINT}
        config={{ commitment: 'processed' }}
      >
        <WalletProvider autoConnect wallets={wallets}>
          <WalletModalProvider>
            <GambaProvider>
              <GambaPlatformProvider
                creator={PLATFORM_CREATOR_ADDRESS}
                games={GAMES}
                tokens={TOKENS}
                defaultCreatorFee={0.01}
                defaultJackpotFee={0.001}
                theme={{
                  button: {
                    background: '#8851ff',
                    backgroundHover: '#9564ff',
                  },
                }}
              >
                <App />
              </GambaPlatformProvider>
            </GambaProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </HashRouter>
  )
}

root.render(<Root />)
