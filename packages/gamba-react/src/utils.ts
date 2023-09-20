import { PublicKey } from '@solana/web3.js'
import { GameResult, PlayMethodParams } from 'gamba-core'

export const randomSeed = (len = 16) => {
  return Array.from({ length: len })
    .map(() => (Math.random() * 16 | 0).toString(16))
    .join('')
}

export interface SimulatePlayParams {
  delay?: number
  strategy?: 'best' | 'worst' | 'random'
}

export const simulatePlay = (
  params: PlayMethodParams,
  simulation: SimulatePlayParams,
  player: PublicKey,
  nonce: number,
) => {
  const { delay = 250, strategy = 'random' } = simulation
  return {
    result: async () => {
      await new Promise((resolve) => setTimeout(resolve, delay))

      const resultIndex = (() => {
        const findRandomIndex = (predicate: (v: number) => unknown) => {
          const candidates = params.bet
            .map((value, index) => [value, index] as const)
            .sort(() => Math.random() - .5)
            .filter(([value]) => predicate(value))
          return candidates[0][1]
        }
        if (strategy === 'best') {
          const bestValue = Math.max(...params.bet)
          return findRandomIndex((value) => value === bestValue)
        }
        if (strategy === 'worst') {
          const worstValue = Math.min(...params.bet)
          return findRandomIndex((value) => value === worstValue)
        }
        return Math.random() * params.bet.length | 0
      })()

      const multiplier = params.bet[resultIndex]
      const payout = params.wager * multiplier
      const profit = payout - params.wager
      const result: GameResult = {
        creator: new PublicKey(params.creator),
        player,
        wager: params.wager,
        bet: params.bet,
        clientSeed: params.seed,
        resultIndex,
        multiplier,
        rngSeed: '',
        nonce,
        payout,
        profit,
      }
      return result
    },
  }
}
