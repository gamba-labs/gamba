import { MIN_BET } from 'gamba-core'
import { useBalances, useGambaClient } from 'gamba-react'

const ESTIMATED_FEE_AND_RENT = 1000000

export function useWagerUtils() {
  const gamba = useGambaClient()
  const balances = useBalances()

  const houseFee = gamba.house.fees.house
  const creatorFee = gamba.house.fees.creator
  const totalFee = houseFee + creatorFee

  return (desiredValue: number, bet?: number[]) => {
    const maxMultiplier = bet ? Math.max(...bet) : 1
    let _val = desiredValue

    const maxWagerForBet = gamba.house.maxPayout / maxMultiplier
    _val = Math.min(_val, maxWagerForBet)

    _val = Math.min(balances.total, _val)

    // Deduct fees:
    const withFees = Math.floor(_val * (1 + totalFee)) + ESTIMATED_FEE_AND_RENT
    if (withFees > balances.total) {
      _val = Math.floor(_val / (1 + totalFee)) - ESTIMATED_FEE_AND_RENT
    }

    return Math.max(MIN_BET, _val)
  }
}
