import { getTokenAccount } from 'gamba-core'
import React, { useState } from 'react'
import { useGamba } from './useGamba'

export function useBonusBalance() {
  const gamba = useGamba()
  const [balance, setBalance] = useState(0)

  React.useEffect(() => {
    const fetchBonusTokens = async () => {
      if (!gamba.wallet || !gamba.house.bonusMint) {
        setBalance(0)
        return
      }
      const { balance } = await getTokenAccount(gamba.connection, gamba.wallet.publicKey, gamba.house.bonusMint)
      setBalance(balance)
    }
    fetchBonusTokens()
  }, [gamba.wallet, gamba.house, gamba.user])

  return balance
}
