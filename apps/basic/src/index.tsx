import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { GambaUi } from 'gamba-react-ui'
import { GambaProvider } from 'gamba/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer, toast } from 'react-toastify'
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
        <GambaProvider creator="DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV">
          <GambaUi
            onError={(err) => toast(err.message, { type: 'error' })}
          >
            <App />
          </GambaUi>
        </GambaProvider>
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>,
)
