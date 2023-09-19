import { GambaError, PlayMethodParams, getTokenAccount } from 'gamba-core'
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

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

/**
 * Play parameters within the gamba context.
 * Here creator and seed isn't needed since it's provided by the context state. (But can be overridden)
 */
interface PlayParams extends Optional<PlayMethodParams, 'creator' | 'seed'> {
  /** Deducts estimated Gamba fees from the wager. A 1 SOL wager will prompt the player to pay exactly 1 SOL. */
  excludeFees?: boolean
}

export function useGamba() {
  const { creator, seed, setSeed } = React.useContext(GambaContext)
  const client = useGambaClient()
  const balances = useBalances()

  const { connection, wallet, state, methods } = client

  const updateSeed = (seed = randomSeed()) => setSeed(seed)

  /**
  * Shorthand for `gamba.methods.play`, which includes creator address and client seed from the Gamba context
  */
  const play = async ({ wager: _wager, excludeFees, ...params }: PlayParams) => {
    const totalFee = state.house.fees.total
    const wager = excludeFees ? Math.ceil(_wager / (1 + totalFee)) : _wager
    const res = await methods.play({
      seed,
      creator,
      wager,
      ...params,
    })
    return { ...res, result: nextResult }
  }

  /**
  * Shorthand for `gamba.methods.redeemBonusToken`, which automatically inserts the correct token addresses
  */
  const redeemBonusToken = async (balance?: number) => {
    if (!state.house.bonusMint) {
      throw new Error('House doesn\'t provide a bonus token')
    }
    const account = await getTokenAccount(connection, wallet.publicKey, state.house.bonusMint)
    return await methods.redeemBonusToken(
      state.house.bonusMint,
      account.associatedTokenAccount,
      balance ?? account.balance,
    )
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
    redeemBonusToken,
    methods,
    nextResult,
  }
}
