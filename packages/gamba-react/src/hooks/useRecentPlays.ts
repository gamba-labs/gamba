import { RecentPlayEvent, getRecentEvents } from 'gamba-core'
import React from 'react'
import { useGamba } from './useGamba'
import { useGambaEvent } from './useGambaClient'

export function useRecentPlays() {
  const gamba = useGamba()
  const [recentPlays, setRecentPlays] = React.useState<RecentPlayEvent[]>([])
  const fetched = React.useRef(false)

  React.useEffect(() => {
    if (fetched.current || !gamba.house?.state.rng) {
      return
    }
    fetched.current = true
    getRecentEvents(gamba.connection, { signatureLimit: 20, rngAddress: gamba.house.state.rng }).then((events) => {
      setRecentPlays(events)
    }).catch((err) => {
      console.error('Failed to get events', err)
    })
  }, [gamba.house])

  useGambaEvent((event) => {
    const isPlayer = gamba.wallet?.publicKey?.equals(event.player)
    setTimeout(() => {
      setRecentPlays((x) => [event, ...x])
    }, isPlayer ? 3000 : 0)
  }, [gamba.wallet])

  return recentPlays
}
