// packages/react/src/multiplayer/useRecentWinners.ts
import { useState, useEffect, useCallback } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useGambaContext } from '../GambaProvider'
import type { ParsedEvent } from './fetch'

/**
 * Convenience hook: fetch & (optionally) poll the last `howMany`
 * winnersSelected events for games by `creator` with `maxPlayers`.
 */
export function useRecentWinners(
  creator: PublicKey,
  maxPlayers: number,
  howMany = 10,
  pollMs?: number,           // if omitted or 0, no polling
) {
  const { provider } = useGambaContext()
  const [events, setEvents]   = useState<ParsedEvent<'winnersSelected'>[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!provider) return
    setLoading(true)
    try {
      const { fetchRecentSpecificWinners } = await import('./fetch')
      const evs = await fetchRecentSpecificWinners(
        provider.anchorProvider,
        creator,
        maxPlayers,
        howMany,
      )
      setEvents(evs)
    } finally {
      setLoading(false)
    }
  }, [provider, creator, maxPlayers, howMany])

  // initial load
  useEffect(() => { refresh() }, [refresh])
  // optional polling
  useEffect(() => {
    if (!pollMs) return
    const id = window.setInterval(refresh, pollMs)
    return () => window.clearInterval(id)
  }, [refresh, pollMs])

  return { events, loading, refresh }
}
