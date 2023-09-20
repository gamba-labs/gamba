import { useConnection } from '@solana/wallet-adapter-react'
import { EventFetcher, EventFetcherParams } from './EventFetcher'
import React from 'react'

function useRerender() {
  const [, set] = React.useState({})
  const rerender = React.useCallback(() => {
    set({})
  }, [])
  return rerender
}

export function useEventFetcher(params?: EventFetcherParams) {
  const { connection } = useConnection()
  const rerender = useRerender()

  const fetcher = React.useMemo(() => new EventFetcher(connection, params), [connection, params])

  React.useEffect(() => fetcher.onEvents(rerender), [fetcher])

  return fetcher
}
