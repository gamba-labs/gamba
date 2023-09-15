import { GambaError, GambaPlayParams } from 'gamba-core'
import React from 'react'
import { GambaContext } from '../GambaProvider'
import { randomSeed } from '../utils'
import { useBalances } from './useBalances'
import { useGambaClient } from './useGambaClient'

/**
 * Catch Gamba method call errors
 */
export function useGambaError(callback: (err: GambaError) => void) {
  const client = useGambaClient()
  React.useEffect(() => client.onError(callback), [callback])
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export function useGamba() {
  const { creator, seed, setSeed } = React.useContext(GambaContext)
  const client = useGambaClient()
  const balances = useBalances()

  const { connection, wallet, state, methods } = client

  const updateSeed = (seed = randomSeed()) => setSeed(seed)

  /**
   * Shorthand for `gamba.methods.play`, which includes creator address and client seed from the Gamba context
   */
  const play = async (params: Optional<GambaPlayParams, 'creator' | 'seed'>) => {
    const res = await client.methods.play({
      seed,
      creator,
      ...params,
    })
    return { ...res, result: nextResult }
  }

  /**
   * Waits for the next game result to occur
   * @returns `GameResult`
   */
  const nextResult = async () => {
    return await client.anticipate(
      (state, previous) => {
        if (!state.user.created) {
          throw new Error('User account was closed.')
        }
        if (state.user.nonce > previous.user.nonce + 1) {
          throw new Error('A nonce was skipped.')
        }
        if (state.user.lastGame && state.user.nonce === previous.user.nonce + 1) {
          return state.user.lastGame
        }
      },
    )
  }

  return {
    connection,
    creator,
    wallet,
    seed,
    updateSeed,
    balances,
    house: state.house,
    user: state.user,
    owner: state.wallet,
    anticipate: client.anticipate.bind(client),
    play,
    methods,
    nextResult,
  }
}
