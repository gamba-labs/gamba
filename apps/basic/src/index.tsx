import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { Gamba } from 'gamba/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import { App } from './App'

import '@solana/wallet-adapter-react-ui/styles.css'
import 'react-toastify/dist/ReactToastify.css'
import './styles.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <ConnectionProvider
    endpoint={import.meta.env.GAMBA_SOLANA_RPC}
    config={{ wsEndpoint: import.meta.env.GAMBA_SOLANA_RPC_WS, commitment: 'processed' }}
  >
    <WalletProvider autoConnect wallets={[]}>
      <WalletModalProvider>
        <ToastContainer />
        <Gamba creator="DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV">
          <App />
        </Gamba>
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>,
)
