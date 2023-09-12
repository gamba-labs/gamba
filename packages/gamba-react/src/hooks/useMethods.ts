import { GambaError, GambaPlayParams, getGameResult } from 'gamba-core'
import React from 'react'
import { GambaContext } from '../GambaProvider'
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

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export function usePlay() {
  const { creator, seed } = React.useContext(GambaContext)
  const client = useGambaClient()
  return useMethodCall(
    async (params: Optional<GambaPlayParams, 'creator' | 'seed'>) => {
      await client.play({ creator, seed, ...params })
      //
      return await client.userAccount.anticipate((current, previous) => {
        if (!current?.decoded?.created) {
          throw new Error(GambaError.USER_ACCOUNT_CLOSED_BEFORE_RESULT)
        }
        if (current.decoded && previous.decoded) {
          const currentNonce = current.decoded.nonce.toNumber()
          // Game nonce incremented by 1
          // We can now derive a result
          if (currentNonce === client.user.nonce + 1) {
            return getGameResult(previous.decoded, current.decoded)
          }
          // Nonce skipped
          if (currentNonce > client.user.nonce + 1) {
            throw new Error(GambaError.FAILED_TO_GENERATE_RESULT)
          }
        }
        // unexpected status
        if (!current?.decoded?.status.playing && !current?.decoded?.status.hashedSeedRequested) {
          console.error('Unexpected status', current?.decoded?.status)
          throw new Error(GambaError.FAILED_TO_GENERATE_RESULT)
        }
      })
    },
  )
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
