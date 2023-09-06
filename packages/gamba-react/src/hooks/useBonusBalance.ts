import { getTokenBalance } from 'gamba-core'
import React, { useState } from 'react'
import { useGamba } from './useGamba'

export function useBonusBalance() {
  const gamba = useGamba()
  const [bonusTokens, setBonusTokens] = useState(0)

  React.useEffect(() => {
    const fetchBonusTokens = async () => {
      if (!gamba.wallet || !gamba.house.bonusMint) {
        setBonusTokens(0)
        return
      }
      const balance = await getTokenBalance(gamba.connection, gamba.wallet.publicKey, gamba.house.bonusMint)
      setBonusTokens(balance)
    }
    fetchBonusTokens()
  }, [gamba.wallet, gamba.house, gamba.user])

  return bonusTokens
}
