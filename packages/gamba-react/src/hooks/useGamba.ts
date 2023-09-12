import { GambaError, GambaError2, GambaPlayParams, deriveGameResult } from 'gamba-core'
import React from 'react'
import { GambaContext } from '../GambaProvider'
import { randomSeed } from '../utils'
import { useBalances } from './useBalances'
import { useGambaClient } from './useGambaClient'
import { useClaim, useCreateAccount } from './useMethods'

/**
 * Catch Gamba method call errors and resolve them in order to automatically re-execute them.
 */
export function useGambaError(callback: (err: GambaError2) => void) {
  const client = useGambaClient()
  React.useEffect(() => client.onError(callback), [callback])
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export function useGamba() {
  const { creator, seed, setSeed } = React.useContext(GambaContext)
  const client = useGambaClient()
  const balances = useBalances()
  const [initialize] = useCreateAccount()
  const [claim] = useClaim()
  const { connection } = client

  const updateSeed = (seed = randomSeed()) => setSeed(seed)

  const play = async (params: Optional<GambaPlayParams, 'creator' | 'seed'>) => {
    const res = await client.play({
      seed,
      creator,
      ...params,
    })
    return {
      ...res,
      result: () => anticipateResult(),
    }
  }

  /**
   * Waits for the user nonce to advance, and then derives a result
   * @returns GameResult
   */
  const anticipateResult = async () => {
    return client.userAccount.anticipate(
      (current, previous) => {
        if (!current?.decoded?.created) {
          throw new Error(GambaError.USER_ACCOUNT_CLOSED_BEFORE_RESULT)
        }
        if (current.decoded && previous.decoded) {
          const currentNonce = current.decoded.nonce.toNumber()
          const previousNonce = previous.decoded.nonce.toNumber()
          // Game nonce incremented by 1
          // We can now derive a result
          if (currentNonce === previousNonce + 1) {
            return deriveGameResult(previous.decoded, current.decoded)
          }
          // Nonce skipped
          if (currentNonce > previousNonce + 1) {
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
    creator,
    updateSeed,
    wallet: client.owner,
    user: client.user,
    house: client.house,
    seed,
    anticipateResult,
    play,
    claim,
    initialize,
    balances,
  }
}
