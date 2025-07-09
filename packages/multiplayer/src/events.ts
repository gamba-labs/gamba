/* ──────────────────────────────────────────────────────────────
   events.ts – log helpers for *all* Multiplayer events
   Anchor 0.31.x   •   browser-friendly (no Node ‘crypto’)
   ──────────────────────────────────────────────────────────── */

   import {
    AnchorProvider,
    EventParser,
    IdlEvents,
    utils as anchorUtils,
  } from "@coral-xyz/anchor";
  import type { IdlAccounts } from "@coral-xyz/anchor";

  
  import { Multiplayer }              from "./types/multiplayer.js";
  import { PROGRAM_ID, getProgram }   from "./index.js";
  
  /* ───────────── 1. Types ───────────── */
  
  type AllEvents = IdlEvents<Multiplayer>;   // "gameCreated", …
  export type EventName = keyof AllEvents;
  export type EventData<N extends EventName> = AllEvents[N];
  
  export interface ParsedEvent<N extends EventName = EventName> {
    data      : EventData<N>;
    signature : string;
    slot      : number;
    blockTime : number | null;
  }
  
  /* ───────────── 2. Generic fetcher ───────────── */
  
  export async function fetchRecentEvents<N extends EventName>(
    provider: AnchorProvider,
    name: N,
    howMany = 5,
  ): Promise<ParsedEvent<N>[]> {
    const { connection } = provider;
    const program = getProgram(provider);
  
    /* 1️⃣ recent signatures (overshoot ×10) */
    const sigs = await connection.getSignaturesForAddress(
      PROGRAM_ID,
      { limit: howMany * 10 },
    );
  
    /* 2️⃣ confirmed transactions */
    const txs = await connection.getTransactions(
      sigs.map(s => s.signature),
      { maxSupportedTransactionVersion: 0 },
    );
  
    /* 3️⃣ decode logs */
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
        /* malformed / legacy log – safely ignore */
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
  
  /* ───────────── 4. Discriminator helper ───────────── */
  
  /**
   * sha256("event:<name>") and return the first 8 bytes.
   * utils.sha256.hash → 64-char hex string, so we hex-decode manually.
   */
  export function getEventDiscriminator<N extends EventName>(name: N): Uint8Array {
    const hex = anchorUtils.sha256.hash(`event:${name}`);       // string length 64
    const bytes = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }
  