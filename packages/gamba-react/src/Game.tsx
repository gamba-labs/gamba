import { PublicKey } from '@solana/web3.js'
import React from 'react'

/**
 * @deprecated To override creator address, pass "creator" as a parameter to the gamba.play method
 */
export function Game({ children }: React.PropsWithChildren<{creator: string | PublicKey}>) {
  return <>{children}</>
}
