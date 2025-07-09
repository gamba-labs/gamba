/* ------------------------------------------------------------------
   fetch.ts – tiny helpers around Anchor’s account APIs
------------------------------------------------------------------- */
import type { AnchorProvider, IdlAccounts } from "@coral-xyz/anchor";
import { utils as anchorUtils, web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

import type { Multiplayer } from "./types/multiplayer.js";
import { getProgram, PROGRAM_ID } from "./constants.js";


export type GameAccountFull = {
  publicKey : Parameters<
    ReturnType<typeof getProgram>["account"]["game"]["fetch"]
  >[0]; // PublicKey
  account   : IdlAccounts<Multiplayer>["game"];
};


export const fetchGames = async (
  provider: AnchorProvider,
  filter?: (g: GameAccountFull) => boolean,
): Promise<GameAccountFull[]> => {
  const program = getProgram(provider);
  const games   = await program.account.game.all();     // RPC
  return filter ? games.filter(filter) : games;
};


export type GambaStateFull = {
  publicKey : PublicKey;
  account   : IdlAccounts<Multiplayer>["gambaState"];
};

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


