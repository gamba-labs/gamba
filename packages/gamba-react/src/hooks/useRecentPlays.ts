import { RecentPlayEvent, getRecentEvents } from 'gamba-core'
import React from 'react'
import { GambaProviderContext } from '../provider'

export function useRecentPlays(callback: (recentPlays: RecentPlayEvent[]) => void) {
  const { client } = React.useContext(GambaProviderContext)
  const fetched = React.useRef(false)

  const _callback = React.useCallback(callback, [])

  React.useEffect(
    () => {
      if (!fetched.current && client.house.state?.rng) {
        fetched.current = true
        getRecentEvents(client.connection, {
          signatureLimit: 20,
          rngAddress: client.house.state.rng,
        }).then((events) => {
          _callback(events)
        }).catch((err) => {
          console.error('Failed to get events', err)
        })
      }
    }
    , [client.house.state?.rng, _callback],
  )

  React.useEffect(
    () =>
      client.onGameResult(
        (event) => {
          _callback([event])
        },
      )
    ,
    [_callback, client],
  )
}
