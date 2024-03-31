import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { FAKE_TOKEN_MINT, GambaPlatformProvider, TokenMetaProvider, makeHeliusTokenFetcher } from 'gamba-react-ui-v2'
import { GambaProvider, SendTransactionProvider } from 'gamba-react-v2'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { PLATFORM_CREATOR_ADDRESS, POOLS } from './constants'
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
    <BrowserRouter>
      <ConnectionProvider
        endpoint={import.meta.env.VITE_RPC_ENDPOINT}
        config={{ commitment: 'processed' }}
      >
        <WalletProvider autoConnect wallets={wallets}>
          <WalletModalProvider>
            <TokenMetaProvider
              // A method for fetching token metadata
              fetcher={
                makeHeliusTokenFetcher(
                  import.meta.env.VITE_HELIUS_API_KEY,
                  { dollarBaseWager: 1 },
                )
              }
              // List of known token metadata
              tokens={[
                {
                  mint: FAKE_TOKEN_MINT,
                  name: 'Fake',
                  symbol: 'FAKE',
                  image: '/fakemoney.png',
                  baseWager: 1e9,
                  decimals: 9,
                  usdPrice: 0,
                },
              ]}
            >
              <SendTransactionProvider priorityFee={200_201}>
                <GambaProvider
                  // __experimental_plugins={[
                  //   // Custom fee (1%)
                  //   createCustomFeePlugin('PUBKEY', .01),
                  // ]}
                >
                  <GambaPlatformProvider
                    creator={PLATFORM_CREATOR_ADDRESS}
                    games={GAMES}
                    defaultCreatorFee={0.01}
                    defaultJackpotFee={0.001}
                    defaultPool={POOLS[0]}
                  >
                    <App />
                  </GambaPlatformProvider>
                </GambaProvider>
              </SendTransactionProvider>
            </TokenMetaProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BrowserRouter>
  )
}

root.render(<Root />)
