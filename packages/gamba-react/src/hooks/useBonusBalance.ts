import { useConnection } from '@solana/wallet-adapter-react'
import { getTokenBalance } from 'gamba-core'
import React, { useState } from 'react'
import { useGamba } from './useGamba'

export function useBonusBalance() {
  const gamba = useGamba()
  const [bonusTokens, setBonusTokens] = useState(0)
  const { connection } = useConnection()

  React.useEffect(() => {
    const fetchBonusTokens = async () => {
      if (!gamba.wallet || !gamba.house) return
      const balance = await getTokenBalance(connection, gamba.wallet.publicKey, gamba.house.state.bonusMint)
      setBonusTokens(balance)
    }
    fetchBonusTokens()
  }, [gamba.wallet, gamba.house, gamba.user])

  return bonusTokens
}
