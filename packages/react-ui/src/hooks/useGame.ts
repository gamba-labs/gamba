import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { GambaPlayInput, useGambaPlay, useNextResult } from 'gamba-react-v2'
import React from 'react'
import { useUserBalance } from '.'
import { GambaPlatformContext } from '../GambaPlatformProvider'
import { GameContext } from '../GameContext'
import { useFakeToken } from './useFakeToken'

export function useGame() {
  const game = React.useContext(GameContext)
  const fake = useFakeToken()
  const context = React.useContext(GambaPlatformContext)
  const balances = useUserBalance()
  const getNextResult = useNextResult()
  const gambaPlay = useGambaPlay()

  const result = async () => {
    if (fake.isActive) {
      return fake.result()
    }
    return getNextResult()
  }

  const play = async (
    input: Pick<GambaPlayInput, 'wager' | 'bet' | 'metadata'>,
    instructions: TransactionInstruction[] = [],
  ) => {
    const metaArgs = input.metadata ?? []
    const metadata = ['0', game.game.id, ...metaArgs]

    const gameInput: GambaPlayInput = {
      ...input,
      creator: new PublicKey(context.platform.creator),
      metadata,
      clientSeed: context.clientSeed,
      creatorFee: context.defaultCreatorFee,
      jackpotFee: context.defaultJackpotFee,
      token: context.selectedPool.token, // ,getPoolAddress(context.selectedPool.token, ),
      poolAuthority: context.selectedPool.authority,
      useBonus: balances.bonusBalance > 0,
    }

    if (fake.isActive) {
      return fake.play(gameInput)
    }

    return gambaPlay(gameInput, instructions)
  }

  return {
    play,
    game: game.game,
    result,
  }
}
