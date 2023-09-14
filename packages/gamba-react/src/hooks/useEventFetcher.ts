import { useConnection } from '@solana/wallet-adapter-react'
import { EventFetcher, EventFetcherParams } from 'gamba-core'
import React from 'react'
import { useRerender } from './useRerender'

export function useEventFetcher(params?: EventFetcherParams) {
  const { connection } = useConnection()
  const rerender = useRerender()

  const fetcher = React.useMemo(() => new EventFetcher(connection, params), [connection, params])

  React.useEffect(() => fetcher.onEvents(rerender), [fetcher])

  return fetcher
}
