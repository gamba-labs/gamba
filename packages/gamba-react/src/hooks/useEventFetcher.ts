import { useConnection } from '@solana/wallet-adapter-react'
import { EventFetcher, EventFetcherParams, GameResult, ParsedGambaTransaction } from 'gamba-core'
import React from 'react'
import { useRerender } from './useRerender'

export function useEventFetcher(params?: EventFetcherParams) {
  const { connection } = useConnection()
  const rerender = useRerender()

  const fetcher = React.useMemo(() => new EventFetcher(connection, params), [connection, params])

  React.useEffect(() => fetcher.onEvents(rerender), [fetcher])

  return fetcher
}

interface UseGambaEventsParams {
  // creator?: PublicKey
  signatureLimit?: number
  listen?: boolean
}

type GambaTransactionWithGameResult = Omit<ParsedGambaTransaction, 'event'> & {event: {gameResult: GameResult}}

export function useGambaEvents(props: UseGambaEventsParams = {}) {
  const {
    listen = true,
    signatureLimit = 20,
    // creator,
  } = props
  const events = useEventFetcher()

  const results = React.useMemo(() =>
    events.transactions.filter((x) => !!x.event.gameResult) as GambaTransactionWithGameResult[]
  , [events.transactions])

  React.useEffect(
    () => {
      if (signatureLimit) {
        events.fetch({ signatureLimit: signatureLimit })
      }
    }
    , [events, signatureLimit],
  )

  React.useEffect(() => {
    if (listen) {
      return events.listen()
    }
  }, [events, listen])

  return results
}
