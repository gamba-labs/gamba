import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
// import '@solana/wallet-adapter-react-ui/styles.css'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { GambaProvider } from 'gamba/react'
import { GambaUi } from 'gamba/react-ui'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { App } from './App'
import { GlobalStyle, theme } from './styles'
import './wallet-adapter-styles.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

function Root() {
  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ]
    , [],
  )

  return (
    <ConnectionProvider
      endpoint={import.meta.env.GAMBA_SOLANA_RPC}
      config={{ wsEndpoint: import.meta.env.GAMBA_SOLANA_RPC_WS, commitment: 'processed' }}
    >
      <WalletProvider autoConnect wallets={wallets}>
        <WalletModalProvider>
          <GambaProvider creator="DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV">
            <GambaUi>
              <ThemeProvider theme={theme}>
                <GlobalStyle />
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </ThemeProvider>
            </GambaUi>
          </GambaProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

root.render(
  <Root />,
)
