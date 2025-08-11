import {
  AnchorProvider,
  BN,
  web3,
} from "@coral-xyz/anchor";
import {
  WRAPPED_SOL_MINT,
  getProgram,
} from "../constants.js";
import {
  deriveGambaState,
  deriveGamePdaFromSeed,
  deriveMetadataPda,
  deriveEscrowPda, 
} from "../utils/pda.js";

export interface CreateGameParams {
  preAllocPlayers: number;
  maxPlayers:      number;
  numTeams:        number;
  winnersTarget:   number;
  wagerType:       number;
  payoutType:      number;
  wager:           BN | number;
  softDuration:    BN | number;
  hardDuration:    BN | number;
  gameSeed:        BN | number;
  minBet:          BN | number;
  maxBet:          BN | number;

  accounts: {
    gameMaker: web3.PublicKey;
    mint:      web3.PublicKey;
  };
}

export const createGameNativeIx = async (
  provider: AnchorProvider,
  p: CreateGameParams,
) => {
  const program    = getProgram(provider);
  const gambaState = await deriveGambaState();
  const gamePda = deriveGamePdaFromSeed(p.gameSeed);
  const metaPda   = deriveMetadataPda(gamePda);

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
      new BN(p.gameSeed),
      new BN(p.minBet),
      new BN(p.maxBet),
    )
    .accounts({
      gameAccount: gamePda,
      metadataACcount:    metaPda,
      mint:        p.accounts.mint,
      gameMaker:   p.accounts.gameMaker,
      gambaState,
    } as any)
    .instruction();

  return ix;
};

export const createGameSplIx = async (
  provider: AnchorProvider,
  p: CreateGameParams,
) => {
  const program                = getProgram(provider);
  const gambaState = await deriveGambaState();
  const gamePda = deriveGamePdaFromSeed(p.gameSeed);
  const metaPda   = deriveMetadataPda(gamePda);
  const escrowPda = deriveEscrowPda(gamePda);

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
      new BN(p.gameSeed),
      new BN(p.minBet),
      new BN(p.maxBet),
    )
    .accounts({
      gameAccount:          gamePda,
      metadataACcount:    metaPda,
      mint:                 p.accounts.mint,
      gameAccountTaAccount: escrowPda,
      gameMaker:            p.accounts.gameMaker,
      gambaState,
    } as any)
    .instruction();

  return ix;
};
export const createGameIx = (
  provider: AnchorProvider,
  p: CreateGameParams,
) =>
  p.accounts.mint.equals(WRAPPED_SOL_MINT)
    ? createGameNativeIx(provider, p)
    : createGameSplIx(provider, p);
