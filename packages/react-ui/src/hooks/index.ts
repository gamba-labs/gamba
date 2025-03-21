import { useBalance, useWalletAddress } from 'gamba-react-v2'
import React from 'react'
import { GambaPlatformContext } from '../GambaPlatformProvider'
import { useCurrentPool } from './useCurrentPool'
import { useFakeToken } from './useFakeToken'
import { useTokenMeta } from './useTokenMeta'
import { PublicKey } from '@solana/web3.js'
import { FAKE_TOKEN_MINT } from '../TokenMetaProvider'

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

export function useCurrentToken() {
  const { token } = React.useContext(GambaPlatformContext).selectedPool
  return useTokenMeta(token)
}

export function useTokenBalance(mint?: PublicKey) {
  const pool = useCurrentPool()
  const token = useCurrentToken()
  const userAddress = useWalletAddress()
  const realBalance = useBalance(userAddress, mint ?? token.mint, pool.authority)
  const fake = useFakeToken()

  if ((!mint && fake.isActive) || mint?.equals(FAKE_TOKEN_MINT)) {
    return {
      ...realBalance,
      balance: fake.balance.balance,
      bonusBalance: 0,
    }
  }

  return realBalance
}

/** @deprecated renamed to "useTokenBalance" */
export function useUserBalance(mint?: PublicKey) {
  return useTokenBalance(mint)
}
