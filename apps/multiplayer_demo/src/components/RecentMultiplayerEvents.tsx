// RecentMultiplayerEvents.tsx
import React, { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { parseTransactionEvents, MULTIPLAYER_PROGRAM_ID } from 'gamba-multiplayer-core';

const RecentMultiplayerEvents = () => {
  const { connection } = useConnection();
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    const setupEventListener = () => {
      const programId = MULTIPLAYER_PROGRAM_ID;

      // Subscribe to program logs
      const subscriptionId = connection.onLogs(
        programId,
        (logs, context) => {
          const events = parseTransactionEvents(logs.logs);
          const newEvents = events.map((event) => ({
            ...event,
            signature: context.signature,
            slot: context.slot,
            time: Date.now(),
          }));

          setRecentEvents((prevEvents) => [...newEvents, ...prevEvents]);
        },
        'confirmed',
      );

      return () => {
        connection.removeOnLogsListener(subscriptionId);
      };
    };

    const cleanup = setupEventListener();
    return cleanup;
  }, [connection]);

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
            <strong>Time:</strong> {new Date(event.time).toLocaleString()}
          </div>
          <div>
            <strong>Signature:</strong> {event.signature}
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
        </div>
      ))}
    </div>
  );
};

export default RecentMultiplayerEvents;
