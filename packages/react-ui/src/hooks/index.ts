import { PublicKey } from '@solana/web3.js'
import { GambaPlayInput, useBalance, useGambaPlay, useNextResult, usePool, useWalletAddress } from 'gamba-react-v2'
import React from 'react'
import { GambaPlatformContext } from '../GambaPlatformProvider'
import { GameContext } from '../GameContext'
import { useTokenMeta } from '../TokenListContext'

export * from './useSound'

export function useFees() {
  const context = React.useContext(GambaPlatformContext)
  const pool = useCurrentPool()
  const creatorFee = context.defaultCreatorFee
  const jackpotFee = context.defaultCreatorFee
  const totalTokenFees = creatorFee + pool.gambaFee + pool.poolFee + jackpotFee
  return totalTokenFees
}

export const useCurrentPool = () => {
  const token = useCurrentToken()
  return usePool(token.mint)
}

export const useCurrentToken = () => {
  const token = React.useContext(GambaPlatformContext).token
  const meta = useTokenMeta(token)
  return meta
}

export const useUserBalance = () => {
  const token = useCurrentToken()
  const userAddress = useWalletAddress()
  return useBalance(userAddress, token.mint)
}

export function useGame() {
  const game = React.useContext(GameContext)
  const context = React.useContext(GambaPlatformContext)
  const balances = useUserBalance()
  const gambaPlay = useGambaPlay()
  const result = useNextResult()

  const play = async (input: Pick<GambaPlayInput, 'wager' | 'bet' | 'metadata'>) => {
    const metaArgs = input.metadata ?? []
    return await gambaPlay({
      ...input,
      creator: new PublicKey(context.platform.creator),
      metadata: ['0', game.game.id, ...metaArgs],
      clientSeed: context.clientSeed,
      creatorFee: context.defaultCreatorFee,
      jackpotFee: context.defaultJackpotFee,
      token: context.token,
      useBonus: balances.bonusBalance > 0,
    })
  }

  return {
    play,
    game: game.game,
    result,
  }
}
