// packages/react/src/multiplayer/fetch.ts
import {
  AnchorProvider,
  EventParser,
  IdlEvents,
} from '@coral-xyz/anchor'
import type { IdlAccounts } from '@coral-xyz/anchor'
import { PublicKey, Finality } from '@solana/web3.js'
import {
  PROGRAM_ID,
  getProgram,
  fetchGames   as _fetchGames,
  fetchGambaState as _fetchGambaState,
  type Multiplayer,
  type GameAccountFull as _GameAccountFull,
} from '@gamba-labs/multiplayer-sdk'

export type GameAccountFull = _GameAccountFull
export type GambaStateFull = { publicKey: PublicKey; account: IdlAccounts<Multiplayer>['gambaState'] }

// ─── RAW ACCOUNT FETCHERS ───────────────────────────────────────
export const fetchGames      = _fetchGames
export const fetchGambaState = _fetchGambaState

// ─── FILTERED GAME FETCHER ──────────────────────────────────────
export type SpecificGameFilters = {
  creator?: PublicKey
  maxPlayers?: number
  wagerType?: number
  payoutType?: number
  winnersTarget?: number
}

export function fetchSpecificGames(
  provider: AnchorProvider,
  filters: SpecificGameFilters,
): Promise<GameAccountFull[]>
export function fetchSpecificGames(
  provider: AnchorProvider,
  creator: PublicKey,
  maxPlayers: number,
): Promise<GameAccountFull[]>
export function fetchSpecificGames(
  provider: AnchorProvider,
  arg1: SpecificGameFilters | PublicKey,
  arg2?: number,
): Promise<GameAccountFull[]> {
  const filters: SpecificGameFilters = arg1 instanceof PublicKey
    ? { creator: arg1, maxPlayers: arg2 }
    : (arg1 ?? {})

  return fetchGames(provider).then(games =>
    games.filter(g => {
      const a = g.account as any
      if (filters.creator && !a.gameMaker.equals(filters.creator)) return false
      if (filters.maxPlayers     != null && a.maxPlayers     !== filters.maxPlayers)     return false
      if (filters.wagerType      != null && Number(a.wagerType)   !== Number(filters.wagerType))   return false
      if (filters.payoutType     != null && Number(a.payoutType)  !== Number(filters.payoutType))  return false
      if (filters.winnersTarget  != null && Number(a.winnersTarget)!== Number(filters.winnersTarget)) return false
      return true
    })
  )
}

// ─── EVENT TYPES ─────────────────────────────────────────────────
export type EventName = keyof IdlEvents<Multiplayer>
export type ParsedEvent<N extends EventName = EventName> = {
  data      : IdlEvents<Multiplayer>[N]
  signature : string
  slot      : number
  blockTime : number | null
}

// ─── GENERIC RECENT EVENT FETCHER ────────────────────────────────
export async function fetchRecentEvents<N extends EventName>(
  provider: AnchorProvider,
  name: N,
  howMany = 10,
): Promise<ParsedEvent<N>[]> {
  const conn    = provider.connection
  const program = getProgram(provider)
  const parser  = new EventParser(PROGRAM_ID, program.coder)
  const FINALITY: Finality = 'confirmed'

  // 1) signatures (overshoot 2×)
  const sigs = await conn.getSignaturesForAddress(
    PROGRAM_ID,
    { limit: howMany * 2 },
    FINALITY,
  )
  // 2) batch transactions
  const txs = await conn.getTransactions(
    sigs.map(s => s.signature),
    { maxSupportedTransactionVersion: 0, commitment: FINALITY }
  )
  // 3) parse logs
  const out: ParsedEvent<N>[] = []
  for (let i = 0; i < txs.length; i++) {
    const logs = txs[i]?.meta?.logMessages
    if (!logs) continue
    for (const ev of parser.parseLogs(logs)) {
      if (ev.name === name) {
        out.push({
          data:      ev.data as IdlEvents<Multiplayer>[N],
          signature: sigs[i].signature,
          slot:      sigs[i].slot,
          blockTime: txs[i]?.blockTime ?? null,
        })
      }
    }
  }
  // newest first, capped
  return out.sort((a, b) => b.slot - a.slot).slice(0, howMany)
}

// ─── RECENT WINNERS FOR SPECIFIC CREATOR/MAX-PLAYERS ─────────────
export async function fetchRecentSpecificWinners(
  provider: AnchorProvider,
  creator: PublicKey,
  maxPlayers: number,
  howMany = 10,
): Promise<ParsedEvent<'winnersSelected'>[]> {
  // fetch raw winnersSelected events
  const events = await fetchRecentEvents(provider, 'winnersSelected', howMany)
  // fetch on-chain games
  const games  = await fetchSpecificGames(provider, creator, maxPlayers)
  const okSet  = new Set(
    games.map(g =>
      typeof g.publicKey === 'string'
        ? g.publicKey
        : g.publicKey.toBase58()
    )
  )
  // filter event.data.gameAccount against that set
  return events.filter(ev => {
    const acct = ev.data.gameAccount
    const key  = typeof acct === 'string' ? acct : acct.toBase58()
    return okSet.has(key)
  })
}
