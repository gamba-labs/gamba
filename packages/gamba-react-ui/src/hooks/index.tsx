import { useConnection } from '@solana/wallet-adapter-react'
import { RecentPlayEvent, getRecentEvents } from 'gamba-core'
import { useGamba, useGambaEvent } from 'gamba-react'
import { useEffect, useRef, useState } from 'react'

export function useRecentPlays() {
  const { connection } = useConnection()
  const gamba = useGamba()
  const [recentPlays, setRecentPlays] = useState<RecentPlayEvent[]>([])
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current || !gamba.house?.state.rng) {
      return
    }
    fetched.current = true
    getRecentEvents(connection, { signatureLimit: 20, rngAddress: gamba.house.state.rng }).then((events) => {
      setRecentPlays(events)
    }).catch((err) => {
      console.error('Failed to get events', err)
    })
  }, [gamba.house])

  useGambaEvent((event) => {
    const isPlayer = gamba.wallet?.publicKey?.equals(event.player)
    setTimeout(() => {
      setRecentPlays((x) => [...x, event])
    }, isPlayer ? 5000 : 0)
  }, [gamba.wallet])

  return recentPlays
}
