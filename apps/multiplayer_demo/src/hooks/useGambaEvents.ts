// usegambeevents.ts
import { useEffect, useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { parseTransactionEvents, convertEventData } from 'gamba-multiplayer-core'
import { PublicKey } from '@solana/web3.js'

export function useMultiplayerEventListener(eventType, { address, signatureLimit = 10 }) {
  const { connection } = useConnection()
  const [events, setEvents] = useState([])

  useEffect(() => {
    // Function to listen to new events
    const subscribeToEvents = () => {
      const subscription = connection.onLogs(
        address,
        (logs, context) => {
          const parsedEvents = parseTransactionEvents(logs.logs)
          const relevantEvents = parsedEvents.filter((event) => event.name === eventType)

          // Mapping to more friendly data structure
          const newEvents = relevantEvents.map((event) => ({
            signature: context.signature,
            slot: context.slot,
            time: Date.now(), // Approximate time
            data: event.data,
          }))

          setEvents((prevEvents) => [...newEvents, ...prevEvents])
        },
        'confirmed',
      )

      return () => {
        connection.removeOnLogsListener(subscription)
      }
    }

    const cleanup = subscribeToEvents()
    return cleanup
  }, [connection, address, eventType])

  return events
}
