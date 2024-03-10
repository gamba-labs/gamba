import { useBalance, useWalletAddress } from 'gamba-react-v2'
import React from 'react'
import { GambaPlatformContext } from '../GambaPlatformProvider'
import { useCurrentPool } from './useCurrentPool'
import { useFakeToken } from './useFakeToken'
import { useTokenMeta } from './useTokenMeta'

export * from './useCurrentPool'
export * from './useFakeToken'
export * from './useGame'
export * from './useSound'
export * from './useTokenMeta'

export function useGambaPlatformContext() {
  return React.useContext(GambaPlatformContext)
}

/**
 *
 * @returns Total amount of fees for the given pool and platform
 */
export function useFees() {
  const context = React.useContext(GambaPlatformContext)
  const pool = useCurrentPool()
  const creatorFee = context.defaultCreatorFee
  const jackpotFee = context.defaultJackpotFee
  return creatorFee + pool.gambaFee + pool.poolFee + jackpotFee
}

export const useCurrentToken = () => {
  const { token } = React.useContext(GambaPlatformContext).selectedPool
  return useTokenMeta(token)
}

export const useUserBalance = () => {
  const token = useCurrentToken()
  const userAddress = useWalletAddress()
  const realBalance = useBalance(userAddress, token.mint)
  const fake = useFakeToken()

  if (fake.isActive) {
    return {
      ...realBalance,
      balance: fake.balance.balance,
      bonusBalance: 0,
    }
  }

  return realBalance
}
