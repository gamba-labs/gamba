// packages/react/src/multiplayer/useSpecificGames.ts

import { useEffect, useState, useCallback } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useGambaContext } from '../GambaProvider'
import { fetchSpecificGames, type GameAccountFull, type SpecificGameFilters } from './fetch'

export function useSpecificGames(
  creator: PublicKey,
  maxPlayers: number,
  pollMs?: number,
): { games: GameAccountFull[]; loading: boolean; refresh: () => Promise<void> }
export function useSpecificGames(
  filters: SpecificGameFilters,
  pollMs?: number,
): { games: GameAccountFull[]; loading: boolean; refresh: () => Promise<void> }
export function useSpecificGames(
  a: PublicKey | SpecificGameFilters,
  b?: number,
) {
  const isLegacy = a instanceof PublicKey
  const filters: SpecificGameFilters = isLegacy
    ? { creator: a as PublicKey, maxPlayers: b as number }
    : ((a as SpecificGameFilters) ?? {})
  const pollMs = isLegacy ? (arguments[2] as number | undefined) ?? 5_000 : (b ?? 5_000)
  const { provider } = useGambaContext()
  const [games,    setGames ] = useState<GameAccountFull[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!provider) return
    setLoading(true)
    try {
      const list = await fetchSpecificGames(provider.anchorProvider, filters)
      setGames(list)
    } finally {
      setLoading(false)
    }
  // stringify filters for stable deps
  }, [provider, JSON.stringify({
    c: filters.creator?.toBase58?.() ?? String(filters.creator ?? ''),
    m: filters.maxPlayers,
    w: filters.wagerType,
    p: filters.payoutType,
    t: filters.winnersTarget,
  })])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    if (!pollMs) return
    const id = window.setInterval(refresh, pollMs)
    return () => window.clearInterval(id)
  }, [refresh, pollMs])

  return { games, loading, refresh }
}
