import { useConnection } from '@solana/wallet-adapter-react'
import { RecentPlayEvent, getRecentEvents, listenForPlayEvents } from 'gamba-core'
import React from 'react'
import { useGambaClient } from './useGambaClient'

export function useRecentPlays(callback?: (newEvents: RecentPlayEvent[]) => void) {
  const { connection } = useConnection()
  const client = useGambaClient()
  const fetched = React.useRef(false)
  const [plays, setPlays] = React.useState<RecentPlayEvent[]>([])

  const handler = React.useCallback(
    (newEvents: RecentPlayEvent[]) => {
      if (callback) {
        callback(newEvents)
      }

      setPlays(
        (prev) => [...newEvents, ...prev],
      )
    },
    [callback],
  )

  React.useEffect(
    () => {
      if (!fetched.current && client.house.rng) {
        fetched.current = true
        getRecentEvents(connection, {
          signatureLimit: 20,
          rngAddress: client.house.rng,
        }).then((events) => {
          handler(events)
        }).catch((err) => {
          console.error('Failed to get events', err)
        })
      }
    }
    , [handler, connection, client.house.rng],
  )

  React.useEffect(
    () =>
      listenForPlayEvents(
        connection,
        (event) => handler([event]),
      )
    ,
    [handler, client],
  )

  return plays
}
