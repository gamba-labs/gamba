// src/events.ts – log helpers for *all* Multiplayer events
// Anchor 0.31.x   •   Solana web3.js v1.98.x

import {
  AnchorProvider,
  EventParser,
  IdlEvents,
  utils as anchorUtils,
} from "@coral-xyz/anchor";
import type { IdlAccounts } from "@coral-xyz/anchor";
import { PublicKey, Finality } from "@solana/web3.js";

import { Multiplayer }            from "./types/multiplayer.js";
import { PROGRAM_ID, getProgram } from "./index.js";

/* ───────────── 1. Types ───────────── */

type AllEvents = IdlEvents<Multiplayer>;   // union of all event names
export type EventName     = keyof AllEvents;
export type EventData<N extends EventName> = AllEvents[N];

export interface ParsedEvent<N extends EventName = EventName> {
  data      : EventData<N>;
  signature : string;
  slot      : number;
  blockTime : number | null;
}

/* ───────────── common finality ───────────── */

const FINALITY: Finality = "confirmed";

/* ───────────── 2. Generic fetcher ───────────── */

export async function fetchRecentEvents<N extends EventName>(
  provider: AnchorProvider,
  name: N,
  howMany = 5,
): Promise<ParsedEvent<N>[]> {
  const { connection } = provider;
  const program = getProgram(provider);

  // 1️⃣ get recent signatures
  const sigs = await connection.getSignaturesForAddress(
    PROGRAM_ID,
    { limit: howMany * 10 },
    FINALITY,
  );

  // 2️⃣ fetch the transactions
  const txs = await connection.getTransactions(
    sigs.map(s => s.signature),
    {
      maxSupportedTransactionVersion: 0,
      commitment: FINALITY,
    },
  );

  // 3️⃣ decode logs
  const parser = new EventParser(PROGRAM_ID, program.coder);
  const out: ParsedEvent<N>[] = [];

  txs.forEach((tx, i) => {
    const logs = tx?.meta?.logMessages;
    if (!logs) return;
    try {
      for (const ev of parser.parseLogs(logs)) {
        if (ev.name === name) {
          out.push({
            data:       ev.data as EventData<N>,
            signature:  sigs[i].signature,
            slot:       sigs[i].slot,
            blockTime:  sigs[i].blockTime ?? null,
          });
        }
      }
    } catch {
      // ignore any malformed / legacy logs
    }
  });

  return out
    .sort((a, b) => b.slot - a.slot)   // newest first
    .slice(0, howMany);
}

/* ───────────── 3. Convenience wrappers ───────────── */

export const fetchRecentGameCreated        = (p: AnchorProvider, n = 5) =>
  fetchRecentEvents(p, "gameCreated",        n);

export const fetchRecentPlayerJoined       = (p: AnchorProvider, n = 5) =>
  fetchRecentEvents(p, "playerJoined",       n);

export const fetchRecentPlayerLeft         = (p: AnchorProvider, n = 5) =>
  fetchRecentEvents(p, "playerLeft",         n);

export const fetchRecentGameSettledPartial = (p: AnchorProvider, n = 5) =>
  fetchRecentEvents(p, "gameSettledPartial", n);

export const fetchRecentWinnersSelected    = (p: AnchorProvider, n = 5) =>
  fetchRecentEvents(p, "winnersSelected",    n);

/* ───────────── 4. fetchRecentSpecificWinners ───────────── */

/**
 * Fetch the most recent "WinnersSelected" events for games
 * created by `creator` with `maxPlayers`. Returns up to `howMany`.
 */
export async function fetchRecentSpecificWinners(
  provider   : AnchorProvider,
  creator    : PublicKey,
  maxPlayers : number,
  howMany    = 8,
): Promise<ParsedEvent<"winnersSelected">[]> {
  // pull raw events (overshoot ×5)
  const raw = await fetchRecentEvents(provider, "winnersSelected", howMany * 5);
  if (!raw.length) return [];

  // filter in‐memory by the two new event fields
  return raw
    .filter(ev =>
      ev.data.gameMaker.equals(creator) &&
      ev.data.maxPlayers === maxPlayers
    )
    .slice(0, howMany);
}

/* ───────────── 5. Discriminator helper ───────────── */

export function getEventDiscriminator<N extends EventName>(name: N): Uint8Array {
  const hex = anchorUtils.sha256.hash(`event:${name}`);
  const bytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
