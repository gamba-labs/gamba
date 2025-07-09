import {
  AnchorProvider, BN, Program, utils as anchorUtils, web3,
} from "@coral-xyz/anchor";
import {
  WRAPPED_SOL_MINT, PROGRAM_ID, getProgram,
} from "../constants.js";
import { dumpIx } from "../utils/ix-debug.js";
import type { Multiplayer } from "../types/multiplayer.js";

/* ------------------------------------------------------------ *
 * Shared params & PDA helper                                   *
 * ------------------------------------------------------------ */
export interface CreateGameParams {
  preAllocPlayers : number;
  maxPlayers      : number;
  numTeams        : number;
  winnersTarget   : number;
  wagerType       : number;
  payoutType      : number;
  wager           : BN | number;
  softDuration    : BN | number;
  hardDuration    : BN | number;

  accounts : {
    gameMaker       : web3.PublicKey;
    mint            : web3.PublicKey;
  };
}

async function deriveStateAndNextGame(
  program: Program<Multiplayer>,
): Promise<{ gambaState: web3.PublicKey; gamePda: web3.PublicKey }> {
  const [gambaState] = web3.PublicKey.findProgramAddressSync(
    [anchorUtils.bytes.utf8.encode("GAMBA_STATE")],
    PROGRAM_ID,
  );

  const state  = await program.account.gambaState.fetch(gambaState);
  const [gamePda] = web3.PublicKey.findProgramAddressSync(
    [anchorUtils.bytes.utf8.encode("GAME"), state.gameId.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID,
  );

  return { gambaState, gamePda };
}

/* ------------------------------------------------------------ *
 * create_game_native  (SOL)                                    *
 * ------------------------------------------------------------ */
export const createGameNativeIx = async (
  provider: AnchorProvider,
  p: CreateGameParams,
) => {
  const program        = getProgram(provider);
  const { gambaState } = await deriveStateAndNextGame(program);

  const ix = await program.methods
    .createGameNative(
      p.preAllocPlayers,
      p.maxPlayers,
      p.numTeams,
      p.winnersTarget,
      p.wagerType,
      p.payoutType,
      new BN(p.wager),
      new BN(p.softDuration),
      new BN(p.hardDuration),
    )
    .accounts({
      mint            : p.accounts.mint,  // WSOL
      gameMaker       : p.accounts.gameMaker,
      gambaState,
    } as any)
    .instruction();

  dumpIx(ix, "createGameNativeIx");
  return ix;
};

/* ------------------------------------------------------------ *
 * create_game_spl  (token games)                               *
 * ------------------------------------------------------------ */
export const createGameSplIx = async (
  provider: AnchorProvider,
  p: CreateGameParams,
) => {
  const program                 = getProgram(provider);
  const { gambaState, gamePda } = await deriveStateAndNextGame(program);

  const [escrowPda] = web3.PublicKey.findProgramAddressSync(
    [gamePda.toBuffer()],
    PROGRAM_ID,
  );

  const ix = await program.methods
    .createGameSpl(
      p.preAllocPlayers,
      p.maxPlayers,
      p.numTeams,
      p.winnersTarget,
      p.wagerType,
      p.payoutType,
      new BN(p.wager),
      new BN(p.softDuration),
      new BN(p.hardDuration),
    )
    .accounts({
      gameAccount          : gamePda,
      mint                 : p.accounts.mint,
      gameAccountTaAccount : escrowPda,
      gameMaker            : p.accounts.gameMaker,
      gambaState,
    } as any)
    .instruction();

  dumpIx(ix, "createGameSplIx");
  return ix;
};

/* Smart dispatcher (public surface) */
export const createGameIx = (
  provider: AnchorProvider,
  p: CreateGameParams,
) =>
  p.accounts.mint.equals(WRAPPED_SOL_MINT)
    ? createGameNativeIx(provider, p)
    : createGameSplIx(provider, p);