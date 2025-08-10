/* ------------------------------------------------------------------
   fetch.ts – tiny helpers around Anchor’s account APIs
   Anchor v0.31.1   •   Solana web3.js v1.98.2
------------------------------------------------------------------- */
import type { AnchorProvider, IdlAccounts } from "@coral-xyz/anchor";
import { BN, utils as anchorUtils, web3 }     from "@coral-xyz/anchor";
import { PublicKey }                          from "@solana/web3.js";

import type { Multiplayer }       from "./types/multiplayer.js";
import { getProgram, PROGRAM_ID } from "./constants.js";
import {
  deriveGamePdaFromSeed,
  deriveMetadataPda,
} from "./utils/pda.js";

/** Full shape of a fetched Game account + its public key */
export type GameAccountFull = {
  publicKey: PublicKey;
  account:   IdlAccounts<Multiplayer>["game"];
};

/**
 * Fetch all Multiplayer game accounts.
 */
export const fetchGames = async (
  provider: AnchorProvider,
  filter?: (g: GameAccountFull) => boolean,
): Promise<GameAccountFull[]> => {
  const program = getProgram(provider);
  const games   = await program.account.game.all();
  return filter ? games.filter(filter) : games;
};

/** Optional filters for narrowing the Multiplayer games list */
export type SpecificGameFilters = {
  creator?: PublicKey;
  maxPlayers?: number;
  wagerType?: number;       // enum repr as u8
  payoutType?: number;      // enum repr as u8
  winnersTarget?: number;
};

/**
 * Fetch games by optional filters. Backwards compatible with the old
 * (provider, creator, maxPlayers) signature.
 */
export function fetchSpecificGames(
  provider: AnchorProvider,
  filters: SpecificGameFilters,
): Promise<GameAccountFull[]>;
export function fetchSpecificGames(
  provider: AnchorProvider,
  creator: PublicKey,
  maxPlayers: number,
): Promise<GameAccountFull[]>;
export async function fetchSpecificGames(
  provider: AnchorProvider,
  arg1: SpecificGameFilters | PublicKey,
  arg2?: number,
): Promise<GameAccountFull[]> {
  const filters: SpecificGameFilters = arg1 instanceof PublicKey
    ? { creator: arg1, maxPlayers: arg2 }
    : (arg1 ?? {});

  return fetchGames(provider, (g) => {
    const a = g.account as IdlAccounts<Multiplayer>["game"] & Record<string, any>;
    if (filters.creator && !a.gameMaker.equals(filters.creator)) return false;
    if (filters.maxPlayers != null && a.maxPlayers !== filters.maxPlayers) return false;
    if (filters.wagerType   != null && Number(a.wagerType)   !== Number(filters.wagerType)) return false;
    if (filters.payoutType  != null && Number(a.payoutType)  !== Number(filters.payoutType)) return false;
    if (filters.winnersTarget != null && Number(a.winnersTarget) !== Number(filters.winnersTarget)) return false;
    return true;
  });
}

/** Shape of the GambaState PDA */
export type GambaStateFull = {
  publicKey: PublicKey;
  account:   IdlAccounts<Multiplayer>["gambaState"];
};

/**
 * Fetch the global GambaState PDA.
 */
export const fetchGambaState = async (
  provider: AnchorProvider,
): Promise<GambaStateFull> => {
  const program = getProgram(provider);
  const [gambaStatePk] = PublicKey.findProgramAddressSync(
    [anchorUtils.bytes.utf8.encode("GAMBA_STATE")],
    PROGRAM_ID,
  );
  const account = await program.account.gambaState.fetch(gambaStatePk);
  return { publicKey: gambaStatePk, account };
};

/** Shape of the PlayerMetadataAccount PDA */
export type MetadataAccountFull = {
  publicKey: PublicKey;
  account:   IdlAccounts<Multiplayer>["playerMetadataAccount"];
};

/**
 * Fetch the on-chain metadata for all players in a game.
 */
export const fetchPlayerMetadata = async (
  provider: AnchorProvider,
  gameSeed: BN | number,
): Promise<Record<string, string>> => {
  const program = getProgram(provider);

  // derive the PDAs
  const gamePda = deriveGamePdaFromSeed(gameSeed);
  const metaPda = deriveMetadataPda(gamePda);

  // fetch & cast explicitly (parenthesized to avoid JSX/generic parse issues)
  const metaAccount = (await program
    .account
    .playerMetadataAccount
    .fetch(metaPda)) as IdlAccounts<Multiplayer>["playerMetadataAccount"];

  const out: Record<string, string> = {};
  const entries = (metaAccount as any).entries as Array<{ player: PublicKey; meta: number[] }>;

  for (const { player, meta } of entries) {
    const buf = Uint8Array.from(meta);
    // trim trailing zeros
    let len = buf.length;
    while (len > 0 && buf[len - 1] === 0) len--;
    const str = new TextDecoder().decode(buf.slice(0, len));
    out[player.toBase58()] = str;
  }

  return out;
};
