import { Gamba } from 'gamba/react'
import { GambaUi } from 'gamba/react-ui'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ThemeProvider } from 'styled-components'
import { App } from './App'
import { GlobalStyle, theme } from './styles'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Gamba
        connection={{
          endpoint: import.meta.env.GAMBA_SOLANA_RPC,
          config: { wsEndpoint: import.meta.env.GAMBA_SOLANA_RPC_WS },
        }}
      >
        <GambaUi
          // Optional Terms of Service warning component (See Tos.tsx):
          // tos={<Tos />}
          onError={(err) => toast(err.message, { type: 'error' })}
          onWithdraw={() => toast('Claimed', { type: 'success' })}
        >
          <App />
        </GambaUi>
      </Gamba>
    </ThemeProvider>
  </BrowserRouter>,
)
