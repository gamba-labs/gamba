import { useGambaClient } from './useGambaClient'

export function useBalances() {
  const client = useGambaClient()

  const user = client.state.user.balance
  const wallet = client.state.wallet.balance
  const bonus = client.state.user.bonusBalance

  return {
    total: user + wallet + bonus,
    bonus,
    wallet,
    user,
  }
}
