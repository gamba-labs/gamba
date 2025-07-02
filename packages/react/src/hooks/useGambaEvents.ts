// react/src/hooks/useGambaEvents.ts

import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import React from 'react'

import {
  fetchRecentLogs,
  subscribeGambaLogs,
  unsubscribeGambaLogs,
  GambaEventType,
  GambaTransaction,
  PROGRAM_ID,
} from 'gamba-core-v2'

export interface UseGambaEventsParams {
  /** Program or account to fetch logs from; defaults to Gamba PROGRAM_ID */
  address?: PublicKey
  /** How many log entries to fetch; defaults to 30 */
  signatureLimit?: number
  /** (reserved) */
  listen?: boolean
}

/**
 * Subscribe to live Gamba events by parsing program logs.
 * Fires `callback` whenever an event with `eventName` arrives.
 */
export function useGambaEventListener<T extends GambaEventType>(
  eventName: T,
  callback: (evt: GambaTransaction<T>) => void,
  deps: React.DependencyList = [],
  address: PublicKey = PROGRAM_ID,
) {
  const { connection } = useConnection()

  React.useEffect(() => {
    const subId = subscribeGambaLogs(
      connection,
      address,
      (evt) => {
        if (evt.name === eventName) {
          callback(evt as GambaTransaction<T>)
        }
      },
    )
    return () => {
      unsubscribeGambaLogs(connection, subId)
    }
  }, [connection, address, eventName, ...deps])
}

/**
 * Fetch past Gamba events by pulling only program logs.
 * Always uses `fetchRecentLogs` under the hood.
 */
export function useGambaEvents<T extends GambaEventType>(
  eventName: T,
  props: UseGambaEventsParams = {},
): GambaTransaction<T>[] {
  const { connection } = useConnection()
  const {
    address = PROGRAM_ID,
    signatureLimit = 30,
  } = props

  const [events, setEvents] = React.useState<GambaTransaction<T>[]>([])

  React.useEffect(() => {
    let mounted = true

    fetchRecentLogs(connection, address, signatureLimit)
      .then((txs) => {
        if (!mounted) return
        // filter only the requested eventName
        setEvents(
          txs.filter((tx): tx is GambaTransaction<T> => tx.name === eventName),
        )
      })
      .catch((err) => {
        console.error('[useGambaEvents] fetchRecentLogs failed:', err)
      })

    return () => {
      mounted = false
    }
  }, [connection, address, signatureLimit, eventName])

  return React.useMemo(() => events, [events])
}
