import { BorshCoder, EventParser } from '@coral-xyz/anchor'
import { Connection, ParsedTransactionWithMeta, PublicKey, SignaturesForAddressOptions } from '@solana/web3.js'
import { AnyMultiplayerEvent, MultiplayerEvent, MultiplayerEventType, IDL, MULTIPLAYER_PROGRAM_ID } from '.'

export type MultiplayerTransaction<Event extends MultiplayerEventType> = {
  signature: string
  time: number
  name: Event
  data: MultiplayerEvent<Event>['data']
}

const eventParser = new EventParser(MULTIPLAYER_PROGRAM_ID, new BorshCoder(IDL))

/**
 * Converts event data fields from hex to decimal if they are hex strings
 */
const convertEventData = (data: any) => {
  const keysToConvert = ['expirationTimestamp', 'wager', 'totalWager', 'totalGambaFee', 'durationSeconds']
  const convertedData = { ...data }

  keysToConvert.forEach((key) => {
    if (convertedData[key] && typeof convertedData[key] === 'string' && convertedData[key].startsWith('0x')) {
      convertedData[key] = parseInt(convertedData[key], 16)
    }
  })

  return convertedData
}

/**
 * Extracts events from transaction logs
 */
export const parseTransactionEvents = (logs: string[]) => {
  try {
    const parsedEvents: AnyMultiplayerEvent[] = []
    const events = eventParser.parseLogs(logs) as any as AnyMultiplayerEvent[]
    for (const event of events) {
      console.log('Parsed Event:', event)  // Log each parsed event for debugging
      parsedEvents.push(event)
    }
    return parsedEvents
  } catch (error) {
    console.error('Failed to parse transaction logs:', error)
    return []
  }
}

/**
 * Extracts events from a transaction
 */
export const parseMultiplayerTransaction = (
  transaction: ParsedTransactionWithMeta,
) => {
  const logs = transaction.meta?.logMessages ?? []
  const events = parseTransactionEvents(logs)

  return events.map((event): MultiplayerTransaction<'GameCreated'> | MultiplayerTransaction<'PlayerJoined'> | MultiplayerTransaction<'PlayerLeft'> | MultiplayerTransaction<'GameSettled'> => {
    const convertedData = convertEventData(event.data)  // Convert event data
    console.log('Converted Event Data:', convertedData)  // Log converted event data for debugging
    return {
      signature: transaction.transaction.signatures[0],
      time: (transaction.blockTime ?? 0) * 1000,
      name: event.name as any,
      data: convertedData,
    }
  })
}

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
  )).flatMap((x) => x ? [x] : [])

  return transactions.flatMap(parseMultiplayerTransaction)
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
  )
  const events = await fetchMultiplayerTransactionsFromSignatures(connection, signatureInfo.map((x) => x.signature))

  return events
}
