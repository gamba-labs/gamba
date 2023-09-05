import { GambaError2, GambaPlayParams } from 'gamba-core'
import React from 'react'
import { parseHouseAccount, parseUserAccount } from '../parsers'
import { GambaContext } from '../provider'
import { randomSeed } from '../utils'
import { useGambaClient } from './useGambaClient'

/**
 * Catch Gamba method call errors and resolve them in order to automatically re-execute them.
 */
export function useGambaError(callback: (err: GambaError2) => void) {
  const client = useGambaClient()
  React.useEffect(() => client.onError(callback), [callback])
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export function useGamba() {
  const { creator: defaultCreator, seed, setSeed } = React.useContext(GambaContext)
  const _client = useGambaClient()
  const { methods, ...client } = _client
  const { connection } = client

  const updateSeed = (seed = randomSeed()) => setSeed(seed)

  const wallet = client.wallet
  const user = React.useMemo(() => parseUserAccount(client.user), [client.user.state])
  const house = React.useMemo(() => parseHouseAccount(client.house), [client.house.state])

  const userBalance = Math.max(0, user?.balance ?? 0)
  const walletBalance = wallet?.info?.lamports ?? 0
  const bonusBalance = user?.bonusBalance ?? 0

  const play = (
    params: Optional<GambaPlayParams, 'creator' | 'seed'>,
  ) => {
    return methods.play({
      seed,
      creator: defaultCreator!,
      ...params,
    })
  }

  return {
    connection,
    _client,
    creator: defaultCreator,
    updateSeed,
    wallet,
    user,
    seed,
    methods: { ...methods, play },
    house,
    suspense: (amount = 0, time = 1000) => {
      //
    },
    balances: {
      total: userBalance + walletBalance + bonusBalance,
      bonus: bonusBalance,
      wallet: walletBalance,
      user: userBalance,
    },
  }
}
