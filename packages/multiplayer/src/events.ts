import {
  AnchorProvider,
  EventParser,
  IdlEvents,
  utils as anchorUtils,
} from '@coral-xyz/anchor'
import { Finality, PublicKey } from '@solana/web3.js'

import { PROGRAM_ID, getProgram } from './index.js'
import { Multiplayer } from './types/multiplayer.js'

type AllEvents = IdlEvents<Multiplayer>;   // union of all event names
export type EventName     = keyof AllEvents;
export type EventData<N extends EventName> = AllEvents[N];

export interface ParsedEvent<N extends EventName = EventName> {
  data      : EventData<N>;
  signature : string;
  slot      : number;
  blockTime : number | null;
}

const FINALITY: Finality = 'confirmed'

export async function fetchRecentEvents<N extends EventName>(
  provider: AnchorProvider,
  name: N,
  howMany = 5,
): Promise<ParsedEvent<N>[]> {
  const { connection } = provider
  const program = getProgram(provider)

  const sigs = await connection.getSignaturesForAddress(
    PROGRAM_ID,
    { limit: howMany * 10 },
    FINALITY,
  )

  const txs = await connection.getTransactions(
    sigs.map(s => s.signature),
    {
      maxSupportedTransactionVersion: 0,
      commitment: FINALITY,
    },
  )

  const parser = new EventParser(PROGRAM_ID, program.coder)
  const out: ParsedEvent<N>[] = []

  txs.forEach((tx, i) => {
    const logs = tx?.meta?.logMessages
    if (!logs) return
    try {
      for (const ev of parser.parseLogs(logs)) {
        if (ev.name === name) {
          out.push({
            data: ev.data as EventData<N>,
            signature: sigs[i].signature,
            slot: sigs[i].slot,
            blockTime: sigs[i].blockTime ?? null,
          })
        }
      }
    } catch {}
  })

  return out
    .sort((a, b) => b.slot - a.slot)   // newest first
    .slice(0, howMany)
}

export const fetchRecentGameCreated        = (p: AnchorProvider, n = 5) =>
  fetchRecentEvents(p, 'gameCreated',        n)

export const fetchRecentPlayerJoined       = (p: AnchorProvider, n = 5) =>
  fetchRecentEvents(p, 'playerJoined',       n)

export const fetchRecentPlayerLeft         = (p: AnchorProvider, n = 5) =>
  fetchRecentEvents(p, 'playerLeft',         n)

export const fetchRecentGameSettledPartial = (p: AnchorProvider, n = 5) =>
  fetchRecentEvents(p, 'gameSettledPartial', n)

export const fetchRecentWinnersSelected    = (p: AnchorProvider, n = 5) =>
  fetchRecentEvents(p, 'winnersSelected',    n)

export async function fetchRecentSpecificWinners(
  provider   : AnchorProvider,
  creator    : PublicKey,
  maxPlayers : number,
  howMany    = 8,
): Promise<ParsedEvent<'winnersSelected'>[]> {
  const raw = await fetchRecentEvents(provider, 'winnersSelected', howMany * 5)
  if (!raw.length) return []

  return raw
    .filter(ev =>
      ev.data.gameMaker.equals(creator) &&
      ev.data.maxPlayers === maxPlayers,
    )
    .slice(0, howMany)
}

export function getEventDiscriminator<N extends EventName>(name: N): Uint8Array {
  const hex = anchorUtils.sha256.hash(`event:${name}`)
  const bytes = new Uint8Array(8)
  for (let i = 0; i < 8; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}
