import { getTokenAccount } from 'gamba-core'
import React from 'react'
import { useGamba } from './useGamba'
import { PublicKey } from '@solana/web3.js'

export function useBonusToken() {
  const gamba = useGamba()
  const [token, setTokenAccount] = React.useState<{
    associatedTokenAccount?: PublicKey,
    balance: number,
  }>({ balance: 0 })

  React.useEffect(() => {
    const fetchBonusTokens = async () => {
      if (!gamba.wallet || !gamba.house.bonusMint) {
        setTokenAccount({ balance: 0 })
        return
      }
      const account = await getTokenAccount(gamba.connection, gamba.wallet.publicKey, gamba.house.bonusMint)
      setTokenAccount({ ...account })
    }
    fetchBonusTokens()
  }, [gamba.wallet, gamba.house, gamba.user])

  return { ...token, mint: gamba.house.bonusMint }
}
