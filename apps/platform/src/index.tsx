import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { FAKE_TOKEN_MINT, GambaPlatformProvider, makeHeliusTokenFetcher, useTokenMeta } from 'gamba-react-ui-v2'
import { GambaProvider } from 'gamba-react-v2'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { PLATFORM_CREATOR_ADDRESS, POOLS } from './constants'
import { GAMES } from './games'
import './styles.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

// We can provide a method for fetching token metadata
if (import.meta.env.VITE_HELIUS_API_KEY) {
  useTokenMeta.setFetcher(
    // Here we fetch requested tokens in batches using Helius RPC
    // (Requires VITE_HELIUS_API_KEY in .env)
    // We set the tokens default wager amount to $1
    makeHeliusTokenFetcher(
      import.meta.env.VITE_HELIUS_API_KEY,
      { dollarBaseWager: 1 },
    ),
  )
}

// We can also fetch token metadata using our own method....
// useTokenMeta.setFetcher(
//   (tokenMints) => {
//     // Fetch data for tokenMints...
//   },
// )

// We can provide a fallback method to get metadata for tokens that might not be retrievable via the provided fetcher
// Or if we already know all the tokens we're going to use in the platform
useTokenMeta.setFallbackHandler((mint) => {
  if (mint.equals(FAKE_TOKEN_MINT)) {
    return {
      name: 'Fake',
      symbol: 'FAKE',
      image: '/fakemoney.png',
      baseWager: 1e9,
      decimals: 9,
      usdPrice: 0,
    }
  }
})

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
            <GambaProvider>
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
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BrowserRouter>
  )
}

root.render(<Root />)
