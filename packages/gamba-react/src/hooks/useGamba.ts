import { GambaError, GambaError2, GambaPlayParams, getGameResult, zeroUnless } from 'gamba-core'
import React from 'react'
import { GambaContext } from '../GambaProvider'
import { randomSeed } from '../utils'
import { useBalances } from './useBalances'
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
  const client = useGambaClient()
  const balances = useBalances()

  const { connection } = client

  const updateSeed = (seed = randomSeed()) => setSeed(seed)

  const play = async (params: Optional<GambaPlayParams, 'creator' | 'seed'>) => {
    const res = await client.play({
      seed,
      creator: defaultCreator!,
      ...params,
    })

    return { ...res, result: () => awaitResult() }
  }

  const awaitResult = async () => {
    const nonce = zeroUnless(client.user?.nonce)
    return await client.userAccount.waitForState(
      (current, previous) => {
        if (!current?.decoded?.created) {
          throw new Error(GambaError.USER_ACCOUNT_CLOSED_BEFORE_RESULT)
        }
        if (current.decoded && previous.decoded) {
          // Game nonce increased
          // We can now derive a result
          // const previousNonce = previous.decoded.nonce.toNumber()
          const currentNonce = current.decoded.nonce.toNumber()
          if (currentNonce === nonce + 1) {
            return getGameResult(previous.decoded, current.decoded)
          }
          // Nonce skipped
          if (currentNonce > nonce + 1) {
            throw new Error(GambaError.FAILED_TO_GENERATE_RESULT)
          }
        }
        // unexpected status
        if (!current?.decoded?.status.playing && !current?.decoded?.status.hashedSeedRequested) {
          console.error('Unexpected status', current?.decoded?.status)
          throw new Error(GambaError.FAILED_TO_GENERATE_RESULT)
        }
      },
    )
  }

  return {
    connection,
    client,
    creator: defaultCreator,
    updateSeed,
    wallet: client.owner,
    user: client.user,
    house: client.house,
    seed,
    awaitResult,
    play,
    balances,
  }
}
