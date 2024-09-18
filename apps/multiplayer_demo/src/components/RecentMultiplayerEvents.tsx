import React, { useEffect, useState } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { parseTransactionEvents, MultiplayerTransaction, MULTIPLAYER_PROGRAM_ID } from 'gamba-multiplayer-core';

const RecentEvents = ({ address }) => {
  const { connection } = useConnection() // Using the wallet adapter's connection context
  const [recentEvents, setRecentEvents] = useState([])

  useEffect(() => {
    // Listener setup function
    const setupEventListener = async () => {
            // Ensure address is provided
            if (!address) {
                console.error('Address is null or undefined')
                return;
            }

            // Create a real-time subscription to the program logs
            const subscriptionId = connection.onLogs(address, (logs, context) => {
                const events = parseTransactionEvents(logs.logs); // Parse logs to extract events
                const filteredEvents = events.map(event => ({
                    ...event,
                    time: context.slot, // Using slot number as an approximation of time
                }));

                setRecentEvents(prevEvents => [...filteredEvents, ...prevEvents]); // Append new events to the state
            });

            return () => {
                connection.removeOnLogsListener(subscriptionId); // Cleanup subscription
            };
        };

        setupEventListener();

    }, [address, connection]); // Dependencies on address and connection

    return (
        <div>
            <h3>Recent Events</h3>
            {recentEvents.length === 0 && <p>No events found.</p>}
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
    );
}

export default RecentEvents;
