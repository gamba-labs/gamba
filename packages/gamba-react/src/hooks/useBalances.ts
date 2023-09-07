import { zeroUnless } from 'gamba-core'
import { useGambaClient } from './useGambaClient'

export function useBalances() {
  const client = useGambaClient()

  const user = client.user.balance
  const wallet = zeroUnless(client.owner.balance)
  const bonus = zeroUnless(client.user.bonusBalance)

  return {
    total: user + wallet + bonus,
    bonus,
    wallet,
    user,
  }
}
