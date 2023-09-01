import { Signal } from '@hmans/signal'
import { PublicKey } from '@solana/web3.js'
import { GambaError2 } from 'gamba-core'
import React from 'react'
import { parseHouseAccount, parseUserAccount } from '../parsers'
import { GambaProviderContext } from '../provider'
import { randomSeed } from '../utils'
import { useGambaClient } from './useGambaClient'

const errorSignal = new Signal<GambaError2>()

export function useGambaError(callback: (err: GambaError2) => void) {
  React.useEffect(() => {
    errorSignal.add(callback)
    return () => {
      errorSignal.remove(callback)
    }
  }, [callback])
}

interface GambaPlayParams {
  /** */
  deductFees?: boolean
  /** */
  creator?: PublicKey | string
}

export function useGamba() {
  const { creator: defaultCreator, onError = () => null, seed, setSeed } = React.useContext(GambaProviderContext)
  const client = useGambaClient()
  const { connection } = client

  const updateSeed = (seed = randomSeed()) => setSeed(seed)

  const wallet = client.wallet
  const user = React.useMemo(() => parseUserAccount(client.user), [client.user.state])
  const house = React.useMemo(() => parseHouseAccount(client.house), [client.house.state])

  const userBalance = user?.balance ?? 0
  const walletBalance = wallet?.info?.lamports ?? 0
  const bonusBalance = user?.bonusBalance ?? 0

  const methods = Object.entries(client.methods)
    .reduce((methods, [methodName, method]) => {
      return {
        ...methods,
        [methodName]: async (...args: (typeof method.arguments)[]) => {
          const retry: any = async () => {
            try {
              return await (method as any)(...args)
            } catch (err) {
              if (err instanceof GambaError2) {
                errorSignal.emit(err)
                try {
                  await err.waitForRetry()
                } catch {
                  throw err
                }
                return await retry()
              } else {
                throw err
              }
            }
          }
          return await retry()
        },
      }
    }, {} as typeof client.methods)

  const play = (
    config: number[],
    wager: number,
    params?: GambaPlayParams,
  ) => {
    return methods.play({
      seed,
      wager,
      gameConfig: config,
      deductFees: params?.deductFees,
      creator: params?.creator ?? defaultCreator!,
    })
  }

  const refresh = async () => {
    await client.user.fetchState(connection)
    await client.wallet.fetchState(connection)
    await client.house.fetchState(connection)
  }

  return {
    connection,
    creator: defaultCreator,
    _client: client,
    updateSeed,
    wallet,
    user,
    seed,
    ...methods,
    methods,
    play,
    refresh,
    house,
    balances: {
      total: userBalance + walletBalance + bonusBalance,
      bonus: bonusBalance,
      wallet: walletBalance,
      user: userBalance,
    },
  }
}
