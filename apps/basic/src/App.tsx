import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import React from 'react'
import DoubleOrNothing from './DoubleOrNothing'

export function App() {
  const { connected } = useWallet()

  return (
    <>
      <header>
        <WalletMultiButton />
      </header>
      <div className="content">
        {!connected ? (
          <>Connect wallet to play</>
        ) : (
          <DoubleOrNothing />
        )}
      </div>
    </>
  )
}
