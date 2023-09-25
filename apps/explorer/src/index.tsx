import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { ConnectionProvider } from '@solana/wallet-adapter-react'
import { Gamba } from 'gamba/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import './styles.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

function Root() {
  return (
    <Theme accentColor="iris" radius="medium" panelBackground="translucent">
      <BrowserRouter>
        <ConnectionProvider
          endpoint={import.meta.env.GAMBA_SOLANA_RPC}
          config={{ wsEndpoint: import.meta.env.GAMBA_SOLANA_RPC_WS, commitment: 'confirmed' }}
        >
          <Gamba creator="DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV">
            <App />
          </Gamba>
        </ConnectionProvider>
      </BrowserRouter>
      {/* <ThemePanel /> */}
    </Theme>
  )
}

root.render(<Root />)
