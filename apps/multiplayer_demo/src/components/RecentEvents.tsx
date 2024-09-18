import React, { useEffect, useState } from 'react'
import { fetchMultiplayerTransactions } from 'gamba-multiplayer-core/src/events'
import { PublicKey, Connection } from '@solana/web3.js'

const RecentEvents = ({ connection, address }) => {
  const [recentEvents, setRecentEvents] = useState([])

  const fetchRecentEvents = async () => {
    try {
      console.log('Address:', address) // Debugging log

      if (!address) {
        console.error('Address is null or undefined')
        return
      }

      const options = {
        limit: 10, // Adjust as needed
      }

      const events = await fetchMultiplayerTransactions(connection, address, options)
      console.log('Recent Events:', events)
      setRecentEvents(events)
    } catch (error) {
      console.error('Error fetching recent events:', error)
    }
  }

  useEffect(() => {
    const fetchInterval = 10000 // Fetch every 10 seconds

    const intervalId = setInterval(() => {
      fetchRecentEvents()
    }, fetchInterval)

    return () => clearInterval(intervalId)
  }, [address])

  return (
    <div>
      <h3>Recent Events</h3>
      {recentEvents.map((event, index) => (
        <div key={index} className="eventCard" style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <div><strong>Event:</strong> {event.name}</div>
          <div><strong>Time:</strong> {new Date(event.time).toLocaleString()}</div>
          <div><strong>Signature:</strong> {event.signature}</div>
          <div><strong>Data:</strong></div>
          <div style={{ paddingLeft: '10px' }}>
            {Object.entries(event.data).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentEvents
