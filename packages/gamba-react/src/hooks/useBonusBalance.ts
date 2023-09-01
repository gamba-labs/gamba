import { getTokenBalance } from 'gamba-core'
import React, { useState } from 'react'
import { useGamba } from './useGamba'

export function useBonusBalance() {
  const gamba = useGamba()
  const [bonusTokens, setBonusTokens] = useState(0)

  React.useEffect(() => {
    const fetchBonusTokens = async () => {
      if (!gamba.wallet || !gamba.house) return
      const balance = await getTokenBalance(gamba.connection, gamba.wallet.publicKey, gamba.house.state.bonusMint)
      setBonusTokens(balance)
    }
    fetchBonusTokens()
  }, [gamba.wallet, gamba.house, gamba.user])

  return bonusTokens
}
