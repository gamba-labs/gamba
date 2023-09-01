import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import '@solana/wallet-adapter-react-ui/styles.css'
import { GambaProvider } from 'gamba/react'
import { GambaUi } from 'gamba/react-ui'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ThemeProvider } from 'styled-components'
import { App } from './App'
import { GlobalStyle, theme } from './styles'
import { PhantomWalletAdapter, UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets'

const root = ReactDOM.createRoot(document.getElementById('root')!)

// root.render(
//   <BrowserRouter>
//     <ThemeProvider theme={theme}>
//       <GlobalStyle />
//       <Gamba
//         connection={{
//           endpoint: import.meta.env.GAMBA_SOLANA_RPC,
//           config: { wsEndpoint: import.meta.env.GAMBA_SOLANA_RPC_WS },
//         }}
//       >
//         <GambaUi
//           // Optional Terms of Service warning component (See Tos.tsx):
//           // tos={<Tos />}
//           onError={(err) => toast(err.message, { type: 'error' })}
//           onWithdraw={() => toast('Claimed', { type: 'success' })}
//         >
//           <App />
//         </GambaUi>
//       </Gamba>
//     </ThemeProvider>
//   </BrowserRouter>,
// )

function Root() {
  const wallets = React.useMemo(
    () => [
      new UnsafeBurnerWalletAdapter(),
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
          <ToastContainer />
          <GambaProvider
            creator="DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV"
            onError={(err) => toast(err.message, { type: 'error' })}
          >
            <GambaUi
              // onError={(err) => toast(err.message, { type: 'error' })}
              onWithdraw={() => toast('Claimed', { type: 'success' })}
            >
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
