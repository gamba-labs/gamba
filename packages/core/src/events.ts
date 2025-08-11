// packages/core/src/events.ts

import { BorshCoder, EventParser } from '@coral-xyz/anchor'
import {
  Connection,
  ParsedTransactionWithMeta,
  PublicKey,
  ConfirmedSignatureInfo,
  SignaturesForAddressOptions,
} from '@solana/web3.js'
import {
  AnyGambaEvent,
  GambaEvent,
  GambaEventType,
  IDL,
  PROGRAM_ID,
} from '.'

export type GambaTransaction<Event extends GambaEventType> = {
  signature: string
  time: number
  name: Event
  data: GambaEvent<Event>['data']
}

const coder = new BorshCoder(IDL)
const parser = new EventParser(PROGRAM_ID, coder)

/** Extract Anchor events from raw logs */
export function parseTransactionEvents(logs: string[]): AnyGambaEvent[] {
  try {
    return parser.parseLogs(logs) as any as AnyGambaEvent[]
  } catch {
    return []
  }
}

/** 
 * 🔴 @deprecated — use `fetchRecentLogs` for real blockTime timestamps
 */
export function parseGambaTransaction(
  transaction: ParsedTransactionWithMeta,
): GambaTransaction<GambaEventType>[] {
  const blockTime = transaction.blockTime ?? 0
  const logs = transaction.meta?.logMessages ?? []
  const evts = parseTransactionEvents(logs)
  return evts.map((ev) => ({
    signature: transaction.transaction.signatures[0],
    time: blockTime * 1000,
    // cast string → literal type
    name: ev.name as GambaEventType,
    data: ev.data,
  }))
}

/** 🔴 @deprecated — replaced by `fetchRecentLogs` */
export async function fetchGambaTransactionsFromSignatures(
  connection: Connection,
  signatures: string[],
): Promise<GambaTransaction<GambaEventType>[]> {
  const txns = await connection.getParsedTransactions(
    signatures,
    { maxSupportedTransactionVersion: 0, commitment: 'confirmed' },
  )
  return txns.flatMap((tx) => (tx ? parseGambaTransaction(tx) : []))
}

/** 🔴 @deprecated — replaced by `fetchRecentLogs` */
export async function fetchGambaTransactions(
  connection: Connection,
  address: PublicKey,
  options: SignaturesForAddressOptions,
): Promise<GambaTransaction<GambaEventType>[]> {
  const sigInfos = await connection.getSignaturesForAddress(
    address,
    options,
    'confirmed',
  )
  const sigs = sigInfos.map((s) => s.signature)
  return fetchGambaTransactionsFromSignatures(connection, sigs)
}

// ─── NEW, lightweight history API ──────────────────────────────────────

/**
 * Fetch recent events using only program logs, but still pull full transactions
 * so we can surface their on‐chain blockTime accurately.
 */
export async function fetchRecentLogs(
  connection: Connection,
  address: PublicKey = PROGRAM_ID,
  limit = 30,
): Promise<GambaTransaction<GambaEventType>[]> {
  // 1) get latest signatures
  const infos: ConfirmedSignatureInfo[] = await connection.getSignaturesForAddress(
    address,
    { limit },
    'confirmed',
  )
  const sigs = infos.map((i) => i.signature)

  // 2) fetch full parsed transactions
  const txns = await connection.getParsedTransactions(sigs, {
    maxSupportedTransactionVersion: 0,
    commitment: 'confirmed',
  })

  // 3) extract events with real timestamps
  const out: GambaTransaction<GambaEventType>[] = []
  for (const tx of txns) {
    if (!tx) continue
    const ts = (tx.blockTime ?? Math.floor(Date.now() / 1000)) * 1000
    const evts = parseTransactionEvents(tx.meta?.logMessages ?? [])
    for (const ev of evts) {
      out.push({
        signature: tx.transaction.signatures[0],
        time: ts,
        name: ev.name as GambaEventType,
        data: ev.data as any,
      })
    }
  }
  return out
}

/**
 * Subscribe to raw program logs, parse Anchor events, and invoke callback
 */
export function subscribeGambaLogs(
  connection: Connection,
  address: PublicKey = PROGRAM_ID,
  callback: (evt: GambaTransaction<GambaEventType>) => void,
): number {
  const connAny = connection as any
  const subId: number = connAny.onLogs(
    address,
    (logInfo: { signature?: string; logs: string[] }) => {
      if (!logInfo.signature) return
      const now = Date.now()
      const evts = parseTransactionEvents(logInfo.logs)
      for (const ev of evts) {
        callback({
          signature: logInfo.signature!,
          time: now,
          name: ev.name as GambaEventType,
          data: ev.data as any,
        })
      }
    },
    'confirmed',
  )
  return subId
}

/** Unsubscribe from `subscribeGambaLogs` */
export function unsubscribeGambaLogs(
  connection: Connection,
  subId: number,
) {
  const connAny = connection as any
  if (typeof connAny.removeOnLogsListener === 'function') {
    connAny.removeOnLogsListener(subId)
  }
}
