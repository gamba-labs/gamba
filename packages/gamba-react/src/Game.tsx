import { PublicKey } from '@solana/web3.js'
import { useGambaProvider } from './hooks/useGambaProvider'
import React, { useEffect } from 'react'

/**
 * Changes the Gamba context's creator address
 */
export function Game({ children, creator }: React.PropsWithChildren<{creator: string | PublicKey}>) {
  const provider = useGambaProvider()

  useEffect(() => {
    const _creator = typeof creator === 'string' ? new PublicKey(creator) : undefined
    provider.setCreator(_creator)
  }, [creator])

  return <>{children}</>
}
