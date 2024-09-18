import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { MultiplayerEventType, fetchMultiplayerTransactions } from 'gamba-multiplayer-core';

export function useMultiplayerEventListener(eventType, { address, signatureLimit = 10 }) {
  const { connection } = useConnection();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Function to listen to new events
    const subscribeToEvents = async () => {
      const subscription = connection.onLogs(address, (logs, context) => {
        const parsedEvents = parseTransactionEvents(logs.logs);
        const relevantEvents = parsedEvents.filter(event => event.name === eventType);

        // Mapping to more friendly data structure
        const newEvents = relevantEvents.map(event => ({
          signature: context.signature,
          slot: context.slot,
          time: new Date().getTime(), // Approximate time, better to use block time for accuracy
          data: event.data,
        }));

        setEvents(prevEvents => [...newEvents, ...prevEvents]);
      }, 'confirmed');

      return () => {
        connection.removeOnLogsListener(subscription);
      };
    };

    subscribeToEvents();

    return () => {
      // Clean up subscription
      connection.removeOnLogsListener(subscribeToEvents);
    };
  }, [connection, address, eventType]);

  return events;
}
