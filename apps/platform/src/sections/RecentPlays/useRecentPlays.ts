// src/hooks/useRecentPlays.ts
import React from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useLocation } from 'react-router-dom'
import { PublicKey } from '@solana/web3.js'

import {
  fetchGambaTransactions,
  parseTransactionEvents,
  GambaTransaction,
  PROGRAM_ID,
} from 'gamba-core-v2'
import { useWalletAddress } from 'gamba-react-v2'
import { PLATFORM_CREATOR_ADDRESS } from '../../constants'

interface Params {
  showAllPlatforms?: boolean
}

export function useRecentPlays({ showAllPlatforms = false }: Params = {}) {
  const location = useLocation()
  const userAddress = useWalletAddress()
  const { connection } = useConnection()

  // one single state array for both history & live
  const [events, setEvents] = React.useState<GambaTransaction<'GameSettled'>[]>([])

  // 1) Fetch on-chain history once on mount / deps change
  React.useEffect(() => {
    let alive = true
    const addr: PublicKey = showAllPlatforms ? PROGRAM_ID : PLATFORM_CREATOR_ADDRESS

    fetchGambaTransactions(connection, addr, { limit: 30 })
      .then((all) => {
        if (!alive) return
        // filter to GameSettled + correct creator
        const filtered = all.filter(
          (e) =>
            e.name === 'GameSettled' &&
            (showAllPlatforms ||
              e.data.creator.equals(PLATFORM_CREATOR_ADDRESS)),
        ) as GambaTransaction<'GameSettled'>[]
        setEvents(filtered)
      })
      .catch(console.error)

    return () => {
      alive = false
    }
  }, [connection, showAllPlatforms])

  // 2) Subscribe to new logs
  React.useEffect(() => {
    let alive = true
    const timeouts: number[] = []

    const listenerId = connection.onLogs(
      PROGRAM_ID,
      (logsObj) => {
        if (!alive) return
        const logs = logsObj.logs ?? []
        const parsed = parseTransactionEvents(logs)

        parsed.forEach((event) => {
          if (event.name !== 'GameSettled') return

          // platform filter
          if (
            !showAllPlatforms &&
            !event.data.creator.equals(PLATFORM_CREATOR_ADDRESS)
          ) {
            return
          }

          // suspenseful delay on “your” plays in certain routes
          const suspenseful =
            event.data.user.equals(userAddress) &&
            ['plinko', 'slots'].some((p) =>
              location.pathname.includes(p),
            )
          const delay = suspenseful ? 3000 : 0

          const id = window.setTimeout(() => {
            if (!alive) return
            setEvents((prev) => [event as any, ...prev])
          }, delay)
          timeouts.push(id)
        })
      },
      'confirmed',
    )

    return () => {
      alive = false
      connection.removeOnLogsListener(listenerId)
      timeouts.forEach(clearTimeout)
    }
  }, [connection, showAllPlatforms, userAddress, location.pathname])

  return events
}
