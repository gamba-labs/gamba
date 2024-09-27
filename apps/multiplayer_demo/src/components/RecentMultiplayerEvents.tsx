// RecentMultiplayerEvents.tsx
import React, { useEffect, useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { parseTransactionEvents, MULTIPLAYER_PROGRAM_ID } from 'gamba-multiplayer-core'
import { Link } from 'react-router-dom'

const RecentMultiplayerEvents = () => {
  const { connection } = useConnection()
  const [recentEvents, setRecentEvents] = useState([])

  useEffect(() => {
    const setupEventListener = () => {
      const programId = MULTIPLAYER_PROGRAM_ID

      const subscriptionId = connection.onLogs(
        programId,
        async (logs, context) => {
          try {
            const blockTime = await connection.getBlockTime(context.slot)
            const events = parseTransactionEvents(logs.logs)
            const newEvents = events.map((event) => ({
              ...event,
              signature: logs.signature,
              slot: context.slot,
              time: blockTime ? blockTime * 1000 : Date.now(),
            }))

            setRecentEvents((prevEvents) => [...newEvents, ...prevEvents].slice(0, 50))
          } catch (error) {
            console.error('Error fetching block time:', error)
          }
        },
        'confirmed',
      )

      return () => {
        connection.removeOnLogsListener(subscriptionId)
      }
    }

    const cleanup = setupEventListener()
    return cleanup
  }, [connection])

  return (
    <div>
      <h3>Recent Multiplayer Events</h3>
      {recentEvents.length === 0 && <p>No events found.</p>}
      {recentEvents.map((event, index) => (
        <div
          key={index}
          className="eventCard"
          style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}
        >
          <div>
            <strong>Event:</strong> {event.name}
          </div>
          <div>
            <strong>Time:</strong>{' '}
            {event.time ? new Date(event.time).toLocaleString() : 'Unknown'}
          </div>
          <div>
            <strong>Transaction ID:</strong>{' '}
            <a
              href={`https://explorer.solana.com/tx/${event.signature}?cluster=mainnet-beta`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {event.signature}
            </a>
          </div>
          <div>
            <strong>Data:</strong>
          </div>
          <div style={{ paddingLeft: '10px' }}>
            {Object.entries(event.data).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong>{' '}
                {typeof value === 'object' ? JSON.stringify(value) : value}
              </div>
            ))}
          </div>
          {event.name === 'GameSettled' && (
            <Link
              to={`/simulation/${event.signature}`}
              style={{ marginTop: '10px', display: 'inline-block' }}
            >
              View Simulation
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

export default RecentMultiplayerEvents
