import { BorshCoder, EventParser } from '@coral-xyz/anchor'
import { Connection, ParsedTransactionWithMeta, PublicKey, SignaturesForAddressOptions } from '@solana/web3.js'
import { AnyGambaEvent, GambaEvent, GambaEventType, IDL, PROGRAM_ID } from '.'

export type GambaTransaction<Event extends GambaEventType> = {
  signature: string
  time: number
  name: Event
  data: GambaEvent<Event>['data']
}

const eventParser = new EventParser(PROGRAM_ID, new BorshCoder(IDL))

/**
 * Extracts events from transaction logs
 */
export const parseTransactionEvents = (logs: string[]) => {
  try {
    const parsedEvents: AnyGambaEvent[] = []
    const events = eventParser.parseLogs(logs) as any as AnyGambaEvent[]
    for (const event of events) {
      parsedEvents.push(event)
    }
    return parsedEvents
  } catch {
    return []
  }
}

/**
 * Extracts events from a transaction
 */
export const parseGambaTransaction = (
  transaction: ParsedTransactionWithMeta,
) => {
  const logs = transaction.meta?.logMessages ?? []
  const events = parseTransactionEvents(logs)

  return events.map((event) => {
    return {
      signature: transaction.transaction.signatures[0],
      time: (transaction.blockTime ?? 0) * 1000,
      name: event.name,
      data: event.data,
    } as GambaTransaction<'GameSettled'> | GambaTransaction<'PoolChange'>
  })
}

export async function fetchGambaTransactionsFromSignatures(
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

  return transactions.flatMap(parseGambaTransaction)
}

/**
 * Fetches recent Gamba events
 */
export async function fetchGambaTransactions(
  connection: Connection,
  address: PublicKey,
  options: SignaturesForAddressOptions,
) {
  const signatureInfo = await connection.getSignaturesForAddress(
    address,
    options,
    'confirmed',
  )
  const events = await fetchGambaTransactionsFromSignatures(connection, signatureInfo.map((x) => x.signature))

  return events
}
