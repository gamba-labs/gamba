// src/events.ts – log helpers for *all* Multiplayer events
// Anchor 0.31.x   •   Solana web3.js v1.98.2

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

type AllEvents = IdlEvents<Multiplayer>;
export type EventName     = keyof AllEvents;
export type EventData<N extends EventName> = AllEvents[N];

export interface ParsedEvent<N extends EventName = EventName> {
  data      : EventData<N>;
  signature : string;
  slot      : number;
  blockTime : number | null;
}

/* ───────────── 2. Common finality ───────────── */

const FINALITY: Finality = "confirmed";

/* ───────────── 3. Generic fetcher ───────────── */

export async function fetchRecentEvents<N extends EventName>(
  provider : AnchorProvider,
  name     : N,
  howMany  = 10,
): Promise<ParsedEvent<N>[]> {
  const { connection } = provider;
  const program = getProgram(provider);

  // 1️⃣ grab signatures (overshoot 2×)
  const sigs = await connection.getSignaturesForAddress(
    PROGRAM_ID,
    { limit: howMany * 2 },
    FINALITY,
  );

  // 2️⃣ fetch those txs
  const txs = await connection.getTransactions(
    sigs.map(s => s.signature),
    {
      maxSupportedTransactionVersion: 0,
      commitment: FINALITY,
    },
  );

  // 3️⃣ parse logs
  const parser = new EventParser(PROGRAM_ID, program.coder);
  const out: ParsedEvent<N>[] = [];

  for (let i = 0; i < txs.length; i++) {
    const logs = txs[i]?.meta?.logMessages;
    if (!logs) continue;
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
      // ignore bad logs
    }
  }

  return out
    .sort((a, b) => b.slot - a.slot)  // newest first
    .slice(0, howMany);
}

/* ───────────── 4. Convenience wrappers ───────────── */

export const fetchRecentGameCreated        = (p: AnchorProvider, n = 10) =>
  fetchRecentEvents(p, "gameCreated",        n);

export const fetchRecentPlayerJoined       = (p: AnchorProvider, n = 10) =>
  fetchRecentEvents(p, "playerJoined",       n);

export const fetchRecentPlayerLeft         = (p: AnchorProvider, n = 10) =>
  fetchRecentEvents(p, "playerLeft",         n);

export const fetchRecentGameSettledPartial = (p: AnchorProvider, n = 10) =>
  fetchRecentEvents(p, "gameSettledPartial", n);

export const fetchRecentWinnersSelected    = (p: AnchorProvider, n = 10) =>
  fetchRecentEvents(p, "winnersSelected",    n);

/* ───────────── 5. Fetch recent *specific* winners ───────────── */

/**
 * Fetch up to the last `howMany` WinnersSelected events for games
 * by `creator` with exactly `maxPlayers`.  Zero extra RPCs beyond
 * fetchRecentEvents’s 2× overshoot.
 */
export async function fetchRecentSpecificWinners(
  provider   : AnchorProvider,
  creator    : PublicKey,
  maxPlayers : number,
  howMany    = 10,
): Promise<ParsedEvent<"winnersSelected">[]> {
  const raw = await fetchRecentEvents(provider, "winnersSelected", howMany);
  if (!raw.length) return [];

  return raw
    .filter(ev =>
      ev.data.gameMaker.equals(creator) &&
      ev.data.maxPlayers === maxPlayers
    )
    .slice(0, howMany);
}

/* ───────────── 6. Discriminator helper ───────────── */

export function getEventDiscriminator<N extends EventName>(name: N): Uint8Array {
  const hex   = anchorUtils.sha256.hash(`event:${name}`);
  const bytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    bytes[i] = parseInt(hex.slice(i*2, i*2+2), 16);
  }
  return bytes;
}
