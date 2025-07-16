// packages/react/src/multiplayer/useRecentMultiplayerEvents.ts

import { useEffect, useState, useCallback } from 'react'
import { useGambaContext } from '../GambaProvider'
import {
  fetchRecentEvents,
  type ParsedEvent,
  type EventName,
} from './fetch'

/**
 * Subscribe (optionally poll) to recent events.
 * @param name    – which Anchor event name
 * @param howMany – how many to show
 * @param pollMs  – interval in ms; omit / 0 ⇒ no polling
 */
export function useRecentMultiplayerEvents<N extends EventName>(
  name: N,
  howMany = 10,
  pollMs?: number,
) {
  const { provider } = useGambaContext()
  const [events,  setEvents ] = useState<ParsedEvent<N>[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!provider) return
    setLoading(true)
    try {
      const evs = await fetchRecentEvents(
        provider.anchorProvider,
        name,
        howMany,
      )
      setEvents(evs)
    } finally {
      setLoading(false)
    }
  }, [provider, name, howMany])

  // initial fetch
  useEffect(() => { refresh() }, [refresh])

  // optional polling
  useEffect(() => {
    if (!pollMs) return
    const id = window.setInterval(refresh, pollMs)
    return () => window.clearInterval(id)
  }, [refresh, pollMs])

  return { events, loading, refresh }
}
