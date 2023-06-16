import { useWallet } from '@solana/wallet-adapter-react'
import { GambaConnectButton } from 'gamba-react-ui'
import React from 'react'
import DoubleOrNothing from './DoubleOrNothing'

export function App() {
  const { connected } = useWallet()

  return (
    <>
      <header>
        <GambaConnectButton />
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
