/* ------------------------------------------------------------------
   fetch.ts – tiny helpers around Anchor’s account APIs
   Anchor v0.31.1   •   Solana web3.js v1.98.2
------------------------------------------------------------------- */
import type { AnchorProvider, IdlAccounts } from "@coral-xyz/anchor";
import { utils as anchorUtils, web3 }        from "@coral-xyz/anchor";
import { PublicKey }                         from "@solana/web3.js";

import type { Multiplayer }      from "./types/multiplayer.js";
import { getProgram, PROGRAM_ID } from "./constants.js";

/** Full shape of a fetched Game account + its public key */
export type GameAccountFull = {
  publicKey: PublicKey;
  account: IdlAccounts<Multiplayer>["game"];
};

/**
 * Fetch all Multiplayer game accounts.
 *
 * @param provider AnchorProvider to drive the RPC calls
 * @param filter   Optional in-memory predicate to narrow results
 * @returns        Array of `{ publicKey, account }`
 */
export const fetchGames = async (
  provider: AnchorProvider,
  filter?: (g: GameAccountFull) => boolean,
): Promise<GameAccountFull[]> => {
  const program = getProgram(provider);
  // RPC under the hood: getProgramAccounts → decode via Anchor
  const games = await program.account.game.all();
  return filter ? games.filter(filter) : games;
};

/**
 * Convenience wrapper: fetch only games created by a given address
 * with a specific maxPlayers value.
 *
 * @param provider   AnchorProvider to drive the RPC calls
 * @param creator    PublicKey of the game creator (gameMaker)
 * @param maxPlayers Exact maxPlayers (u16) to match
 * @returns          Filtered array of `{ publicKey, account }`
 */
export const fetchSpecificGames = async (
  provider: AnchorProvider,
  creator: PublicKey,
  maxPlayers: number,
): Promise<GameAccountFull[]> => {
  return fetchGames(provider, (g) => {
    const acct = g.account;
    return (
      acct.gameMaker.equals(creator) &&
      acct.maxPlayers === maxPlayers
    );
  });
};

/** Full shape of the on-chain GambaState account + its public key */
export type GambaStateFull = {
  publicKey: PublicKey;
  account: IdlAccounts<Multiplayer>["gambaState"];
};

/**
 * Fetch the global GambaState PDA account.
 *
 * @param provider AnchorProvider to drive the RPC calls
 * @returns        `{ publicKey, account }` of the GambaState
 */
export const fetchGambaState = async (
  provider: AnchorProvider,
): Promise<GambaStateFull> => {
  const program = getProgram(provider);

  // Derive the PDA for GAMBA_STATE
  const [gambaStatePk] = PublicKey.findProgramAddressSync(
    [anchorUtils.bytes.utf8.encode("GAMBA_STATE")],
    PROGRAM_ID,
  );

  // Fetch and decode via Anchor
  const account = await program.account.gambaState.fetch(gambaStatePk);
  return { publicKey: gambaStatePk, account };
};
