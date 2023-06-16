import { GambaUi } from 'gamba-react-ui'
import { Gamba } from 'gamba/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { App } from './App'
import './styles.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <Gamba
    creator="DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV"
    connection={{
      endpoint: import.meta.env.GAMBA_SOLANA_RPC,
      config: { wsEndpoint: import.meta.env.GAMBA_SOLANA_RPC_WS, commitment: 'processed' },
    }}
  >
    <GambaUi
      onError={(err) => toast(err.message, { type: 'error' })}
    >
      <ToastContainer />
      <App />
    </GambaUi>
  </Gamba>,
)

// IF YOU NEED TO USE YOUR OWN PROVIDERS FOR CONNECTION / WALLET:
// root.render(
//   <ConnectionProvider
//     endpoint={import.meta.env.GAMBA_SOLANA_RPC}
//     config={{ wsEndpoint: import.meta.env.GAMBA_SOLANA_RPC_WS, commitment: 'processed' }}
//   >
//     <WalletProvider autoConnect wallets={[]}>
//       <WalletModalProvider>
//         <ToastContainer />
//         <GambaProvider creator="DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV">
//           <GambaUi
//             onError={(err) => toast(err.message, { type: 'error' })}
//           >
//             <App />
//           </GambaUi>
//         </GambaProvider>
//       </WalletModalProvider>
//     </WalletProvider>
//   </ConnectionProvider>,
// )
