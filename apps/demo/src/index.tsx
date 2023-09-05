import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
// import '@solana/wallet-adapter-react-ui/styles.css'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { Gamba } from 'gamba/react'
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
          <Gamba creator="DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV">
            <ThemeProvider theme={theme}>
              <GlobalStyle />
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ThemeProvider>
          </Gamba>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

root.render(
  <Root />,
)
