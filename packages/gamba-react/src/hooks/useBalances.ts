import { useGambaClient } from './useGambaClient'

export function useBalances() {
  const client = useGambaClient()

  const user = client.user.balance
  const wallet = client.owner.balance
  const bonus = client.user.bonusBalance

  return {
    total: user + wallet + bonus,
    bonus,
    wallet,
    user,
  }
}
