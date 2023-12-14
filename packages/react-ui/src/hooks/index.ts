import React from 'react'
import { GambaPlatformContext } from '../GambaPlatformProvider'
import { GambaUi } from '../GambaUi'

export * from './useSound'

export function useFees() {
  const context = React.useContext(GambaPlatformContext)
  const pool = GambaUi.useCurrentPool()
  const creatorFee = context.defaultCreatorFee
  const jackpotFee = context.defaultCreatorFee
  const totalTokenFees = creatorFee + pool.gambaFee + pool.poolFee + jackpotFee
  return totalTokenFees
}
