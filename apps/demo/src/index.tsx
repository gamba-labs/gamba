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

function Tos() {
  return (
    <>
      <strong>AGREEMENT TO TERMS:</strong> These Terms of Service constitute a legally binding
        agreement made between you, whether personally or on behalf of an
        entity (“you”) and this website ("Company","protocol", “we”, “us”, or
        “our”), concerning your access to and use of any websites or platforms
        built on the Gamba platform, including our website (collectively
        referred to as the “Sites”). You agree that by accessing the Sites, you
        have read, understood, and agree to be bound by all of these Terms of
        Service.

      <br />
      <br />

      <strong>AGE AND LEGAL ACCESS CERTIFICATION:</strong> By using the Sites, you certify that
    you are at least 18 years of age or the age of legal consent for
    engaging in gambling activities under the laws of the jurisdiction in
    which you reside. Participation in the activities and games of the Sites
    (the "Game") is open only to residents of those jurisdictions where such
    participation is legal and not prohibited.

      <br />
      <br />

      <strong>PROHIBITED JURISDICTIONS:</strong> Residents from the following countries are strictly
    prohibited from using the Sites: United Arab Emirates, Jordan, North Korea, China,
    Singapore, India, Russia, Saudi Arabia, Japan, Afghanistan, Iran, Pakistan, Qatar,
    Libya, Sudan, Somalia, Bahrain, Kuwait, Brunei, Algeria, Bangladesh, Oman, Yemen,
    Malaysia, Indonesia, Vietnam, South Korea, Cuba, Iraq, Syria, Spain, and the United
    States of America. It is the responsibility of the individual player to ensure that
    they are acting within the law when accessing the Sites.

      <br />
      <br />

      <strong>RISK ACKNOWLEDGEMENT:</strong> By participating in any Game on the Sites, you acknowledge
    that you fully understand that there is a risk of losing money when gambling by means
    of the Sites and that you are fully responsible for any such loss. You agree that your
    use of the Sites is at your sole option, discretion, and risk.

      <br />
      <br />

      <strong>AMENDMENTS:</strong> We reserve the right to amend these Terms of Service at any time. Your
    continued use of the Sites will signify your acceptance of any adjustment to these terms.
    </>
  )
}

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
          tos={<Tos />}
          onError={(err) => toast(err.message, { type: 'error' })}
          onWithdraw={() => toast('Claimed', { type: 'success' })}
        >
          <App />
        </GambaUi>
      </Gamba>
    </ThemeProvider>
  </BrowserRouter>,
)
