import { GambaError, PlayMethodParams, getTokenAccount } from 'gamba-core'
import React from 'react'
import { GambaContext } from '../GambaProvider'
import { randomSeed, simulatePlay } from '../utils'
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
  const { creator, seed, setSeed, fakePlay } = React.useContext(GambaContext)
  const client = useGambaClient()
  const balances = useBalances()

  const { connected, connection, wallet, state, methods, addresses } = client

  const updateSeed = (seed = randomSeed()) => setSeed(seed)

  /**
  * Shorthand for `gamba.methods.play` which includes creator address and client seed from the Gamba context.
  */
  const play = async (_params: PlayParams) => {
    const {
      excludeFees,
      wager: _wager,
      ...rest
    } = _params
    const totalFee = state.house.fees.total
    const wager = excludeFees ? Math.ceil(_wager / (1 + totalFee)) : _wager

    const params: PlayMethodParams = {
      wager,
      creator,
      seed,
      ...rest,
    }

    if (fakePlay) {
      return simulatePlay(params, fakePlay, addresses.wallet, state.user.nonce)
    }

    const res = await methods.play(params)

    return {
      ...res,
      result: nextResult,
    }
  }

  /**
  * Shorthand for `gamba.methods.redeemBonusToken` which automatically inserts the houses's token mint
  */
  const redeemBonusToken = async (amount?: number) => {
    if (!state.house.bonusMint) {
      throw new Error('House doesn\'t provide a bonus token')
    }
    const account = await getTokenAccount(connection, wallet.publicKey, state.house.bonusMint)
    const res = await methods.redeemBonusToken(
      state.house.bonusMint,
      account.associatedTokenAccount,
      amount ?? account.balance,
    )
    await client.anticipate((state, prev) => state.user.bonusBalance > prev.user.bonusBalance)
    return res
  }

  /**
  * Shorthand for `gamba.methods.withdraw`
  */
  const withdraw = async (amount?: number) => {
    const res = await methods.withdraw(amount ?? balances.user)
    await client.anticipate((state, prev) => state.user.balance < prev.user.balance)
    return res
  }

  /**
  * Shorthand for `gamba.methods.initializeAccount`
  */
  const initializeAccount = async () => {
    const res = await methods.initializeAccount()
    await client.anticipate((state) => state.user.created)
    return res
  }

  /**
  * Shorthand for `gamba.methods.closeAccount`
  */
  const closeAccount = async () => {
    const res = await methods.closeAccount()
    await client.anticipate((state) => !state.user.created)
    return res
  }

  /**
   * Waits for the next game result to occur
   * @returns `GameResult`
   */
  const nextResult = () =>
    client.anticipate(
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

  return {
    addresses,
    /** If a wallet has been connected to the Gamba provider */
    connected,
    connection,
    creator,
    wallet,
    seed,
    updateSeed,
    balances,
    house: state.house,
    user: state.user,
    owner: state.wallet,
    /** Wait for a state change to occur */
    anticipate: client.anticipate.bind(client),
    play,
    redeemBonusToken,
    initializeAccount,
    closeAccount,
    withdraw,
    methods,
    nextResult,
  }
}
