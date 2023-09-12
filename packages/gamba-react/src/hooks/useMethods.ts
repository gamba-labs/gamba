import React from 'react'
import { useGambaClient } from './useGambaClient'

function useMethodCall<T, Args extends unknown[]>(fn: (...args: Args) => Promise<T>) {
  const [loading, setLoading] = React.useState(false)
  const func = async (...args: Args) => {
    try {
      setLoading(true)
      await fn(...args)
    } finally {
      setLoading(false)
    }
  }
  return [func, loading] as const
}

export function useRedeemBonus() {
  const client = useGambaClient()
  return useMethodCall(
    async (amount: number) => {
      await client.redeemBonusToken(amount)
      await client.userAccount.anticipate((curr, prev) => {
        if (curr.decoded?.bonusBalance > prev.decoded?.bonusBalance) {
          return true
        }
      })
    },
  )
}

export function useClaim() {
  const client = useGambaClient()
  return useMethodCall(
    async (amount?: number) => {
      await client.withdraw(amount)
      await client.userAccount.anticipate((curr, prev) => {
        if (curr.decoded?.balance < prev.decoded?.balance) {
          return true
        }
      })
    },
  )
}

export function useCloseAccount() {
  const client = useGambaClient()
  return useMethodCall(
    async () => {
      await client.closeAccount()
      await client.userAccount.anticipate(
        (current) => {
          if (!current.decoded?.created) {
            return true
          }
        },
      )
    },
  )
}

export function useCreateAccount() {
  const client = useGambaClient()
  return useMethodCall(
    async () => {
      await client.initializeAccount()
      await client.userAccount.anticipate(
        (current) => {
          if (current.decoded?.created) {
            return true
          }
        },
      )
    },
  )
}
