// packages/react/src/multiplayer/useRecentMultiplayerEvents.ts

import { useEffect, useState, useCallback, useRef } from 'react'
import { useGambaContext } from '../GambaProvider'
import {
  fetchRecentEvents,
  type ParsedEvent,
  type EventName,
} from './fetch'
import { PROGRAM_ID, subscribeGambaLogs, unsubscribeGambaLogs } from 'gamba-core-v2'

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
  const seen = useRef<Set<string>>(new Set())

  const refresh = useCallback(async () => {
    if (!provider) return
    setLoading(true)
    try {
      const evs = await fetchRecentEvents(
        provider.anchorProvider,
        name,
        howMany,
      )
      // seed the seen-set and state with newest-first unique events
      const next = [] as ParsedEvent<N>[]
      const local = new Set<string>()
      for (const ev of evs) {
        const key = ev.signature
        if (!local.has(key)) {
          local.add(key)
          next.push(ev)
        }
      }
      seen.current = local
      setEvents(next)
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

  // live logs subscription (append matching events)
  useEffect(() => {
    if (!provider) return
    const conn = provider.anchorProvider.connection as any
    const subId = subscribeGambaLogs(
      conn,
      PROGRAM_ID,
      (evt) => {
        // filter by event name
        if (evt.name !== (name as any)) return
        // avoid duplicates
        if (seen.current.has(evt.signature)) return
        seen.current.add(evt.signature)
        setEvents((prev) => {
          const next = [{
            data: evt.data as any,
            signature: evt.signature,
            slot: 0,
            blockTime: Math.floor(evt.time / 1000),
          } as ParsedEvent<N>, ...prev]
          // cap to howMany
          return next.slice(0, howMany)
        })
      },
    )
    return () => {
      unsubscribeGambaLogs(conn, subId)
    }
  }, [provider, name, howMany])

  return { events, loading, refresh }
}
