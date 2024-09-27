// events.ts
import { BorshCoder, EventParser, BN } from '@coral-xyz/anchor';
import { Connection, ParsedTransactionWithMeta, PublicKey, SignaturesForAddressOptions } from '@solana/web3.js';
import { AnyMultiplayerEvent, MultiplayerEvent, MultiplayerEventType, IDL, MULTIPLAYER_PROGRAM_ID } from '.';

export type MultiplayerTransaction<Event extends MultiplayerEventType> = {
  signature: string;
  time: number;
  name: Event;
  data: MultiplayerEvent<Event>['data'];
};

const eventParser = new EventParser(MULTIPLAYER_PROGRAM_ID, new BorshCoder(IDL));

/**
 * Converts event data fields from BN and PublicKey to strings for display
 */
const convertEventData = (data: any) => {
  const convertedData = { ...data };

  for (const key in convertedData) {
    const value = convertedData[key];
    if (value instanceof BN) {
      // Convert BN to string
      convertedData[key] = value.toString();
    } else if (value instanceof PublicKey) {
      // Convert PublicKey to base58 string
      convertedData[key] = value.toBase58();
    } else if (Array.isArray(value)) {
      // Process arrays recursively
      convertedData[key] = value.map((item: any) => {
        if (item instanceof BN) {
          return item.toString();
        } else if (item instanceof PublicKey) {
          return item.toBase58();
        } else {
          return item;
        }
      });
    }
    // else leave the value as is
  }

  return convertedData;
};

/**
 * Extracts events from transaction logs and converts event data
 */
export const parseTransactionEvents = (logs: string[]) => {
  try {
    const parsedEvents: AnyMultiplayerEvent[] = [];
    const events = eventParser.parseLogs(logs);
    for (const event of events) {
      const convertedData = convertEventData(event.data);
      const convertedEvent = {
        ...event,
        data: convertedData,
      };
      console.log('Parsed Event:', convertedEvent); // Log each parsed event for debugging
      parsedEvents.push(convertedEvent);
    }
    return parsedEvents;
  } catch (error) {
    console.error('Failed to parse transaction logs:', error);
    return [];
  }
};

/**
 * Extracts events from a transaction
 */
export const parseMultiplayerTransaction = (
  transaction: ParsedTransactionWithMeta,
) => {
  const logs = transaction.meta?.logMessages ?? [];
  const events = parseTransactionEvents(logs);

  return events.map((event): MultiplayerTransaction<any> => {
    return {
      signature: transaction.transaction.signatures[0],
      time: (transaction.blockTime ?? 0) * 1000,
      name: event.name,
      data: event.data,
    };
  });
};

export async function fetchMultiplayerTransactionsFromSignatures(
  connection: Connection,
  signatures: string[],
) {
  const transactions = (await connection.getParsedTransactions(
    signatures,
    {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    },
  )).flatMap((x) => (x ? [x] : []));

  return transactions.flatMap(parseMultiplayerTransaction);
}

/**
 * Fetches recent Multiplayer events
 */
export async function fetchMultiplayerTransactions(
  connection: Connection,
  address: PublicKey,
  options: SignaturesForAddressOptions,
) {
  const signatureInfo = await connection.getSignaturesForAddress(
    address,
    options,
    'confirmed',
  );
  const events = await fetchMultiplayerTransactionsFromSignatures(
    connection,
    signatureInfo.map((x) => x.signature),
  );

  return events;
}
