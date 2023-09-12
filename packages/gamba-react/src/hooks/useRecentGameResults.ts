import { useConnection } from '@solana/wallet-adapter-react'
import { GameResult, getGameResults, listenForPlayEvents } from 'gamba-core'
import React from 'react'
import { useGamba } from './useGamba'

export function useRecentGameResults() {
  const { connection } = useConnection()
  const gamba = useGamba()
  const fetched = React.useRef(false)
  const [plays, setPlays] = React.useState<GameResult[]>([])

  const handler = (newEvents: GameResult[]) => {
    setPlays(
      (prev) => [...newEvents, ...prev],
    )
  }

  React.useEffect(
    () => {
      if (!fetched.current) {
        fetched.current = true
        getGameResults(connection, {
          signatureLimit: 20,
          address: gamba.creator,
        }).then(({ results }) => {
          handler(results)
        }).catch((err) => {
          console.error('Failed to get events', err)
        })
      }
    }
    , [connection],
  )

  React.useEffect(
    () =>
      listenForPlayEvents(
        connection,
        (event) => handler([event]),
        gamba.creator,
      )
    ,
    [connection, gamba.creator],
  )

  return plays
}
