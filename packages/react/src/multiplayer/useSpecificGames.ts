// packages/react/src/multiplayer/useSpecificGames.ts

import { useEffect, useState, useCallback } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useGambaContext } from '../GambaProvider'
import { fetchSpecificGames, type GameAccountFull } from './fetch'

export function useSpecificGames(
  creator: PublicKey,
  maxPlayers: number,
  pollMs = 5_000,      // default poll every 5 s
) {
  const { provider } = useGambaContext()
  const [games,    setGames ] = useState<GameAccountFull[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!provider) return
    setLoading(true)
    try {
      const list = await fetchSpecificGames(
        provider.anchorProvider,
        creator,
        maxPlayers,
      )
      setGames(list)
    } finally {
      setLoading(false)
    }
  }, [provider, creator, maxPlayers])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    if (!pollMs) return
    const id = window.setInterval(refresh, pollMs)
    return () => window.clearInterval(id)
  }, [refresh, pollMs])

  return { games, loading, refresh }
}
