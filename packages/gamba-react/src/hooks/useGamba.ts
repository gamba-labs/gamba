import { GambaError2, GambaPlayParams } from 'gamba-core'
import React from 'react'
import { create } from 'zustand'
import { parseHouseAccount, parseUserAccount } from '../parsers'
import { GambaProviderContext } from '../provider'
import { randomSeed } from '../utils'
import { useGambaClient } from './useGambaClient'

export function useGambaError(callback: (err: GambaError2) => void) {
  const client = useGambaClient()
  React.useEffect(() => client.onError(callback), [callback])
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

const useSuspended = create<{add:(x: number) => void, remove:(x: number) => void, suspended: number}>((set) => ({
  suspended: 0,
  add: (suspended) => set((s) => ({ suspended: s.suspended + suspended })),
  remove: (suspended) => set((s) => ({ suspended: s.suspended - suspended })),
}))

export function useGamba() {
  const { creator: defaultCreator, seed, setSeed } = React.useContext(GambaProviderContext)
  const _client = useGambaClient()
  const { methods, ...client } = _client
  const { connection } = client
  const suspended = useSuspended()

  const updateSeed = (seed = randomSeed()) => setSeed(seed)

  const wallet = client.wallet
  const user = React.useMemo(() => parseUserAccount(client.user), [client.user.state])
  const house = React.useMemo(() => parseHouseAccount(client.house), [client.house.state])

  const [_userBalance, setUserBalance] = React.useState(user?.balance ?? 0)

  React.useEffect(
    () => {
      const debounce = setTimeout(() => {
        setUserBalance(user?.balance ?? 0)
      }, 250)
      return () => void clearTimeout(debounce)
    }
    , [user?.balance],
  )

  const userBalance = Math.max(0, _userBalance - suspended.suspended)
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
      suspended.add(amount)
      setTimeout(() => {
        suspended.remove(amount)
      }, time)
    },
    balances: {
      total: userBalance + walletBalance + bonusBalance,
      bonus: bonusBalance,
      wallet: walletBalance,
      user: userBalance,
    },
  }
}
