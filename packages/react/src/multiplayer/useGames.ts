import { useEffect, useState, useCallback } from 'react'
import { useGambaContext } from '../GambaProvider'
import { fetchGames, type GameAccountFull } from './fetch'
import { PROGRAM_ID } from '@gamba-labs/multiplayer-sdk'

const DATA_SIZE = 1864 // bytes of a Game account

export function useGames() {
  const { provider } = useGambaContext()
  const [games, setGames]     = useState<GameAccountFull[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!provider) return
    setLoading(true)
    try {
      const list = await fetchGames(provider.anchorProvider)
      list.sort((a, b) => Number(b.account.gameId) - Number(a.account.gameId))
      setGames(list)
    } finally {
      setLoading(false)
    }
  }, [provider])

  // initial load
  useEffect(() => {
    void refresh()
  }, [refresh])

  // re-fetch whenever any game account changes on-chain
  useEffect(() => {
    if (!provider) return
    const conn  = provider.anchorProvider.connection
    const subId = conn.onProgramAccountChange(
      PROGRAM_ID,
      () => { void refresh() },
      'confirmed',
      [{ dataSize: DATA_SIZE }],
    )
    return () => {
      conn.removeProgramAccountChangeListener(subId)
    }
  }, [provider, refresh])

  return { games, loading, refresh }
}
