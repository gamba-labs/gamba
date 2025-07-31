// src/sdk/joinGame.ts

import { AnchorProvider, BN, utils as anchorUtils, web3 } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync as ata } from "@solana/spl-token";
import { WRAPPED_SOL_MINT, getProgram } from "../constants.js";
import {
  deriveGambaState,
  deriveMetadataPda,
  deriveEscrowPda,
} from "../utils/pda.js";

export interface JoinGameParams {
  creatorFeeBps:  number;
  wager:          BN | number;
  team?:          number; //defaults to 0
  playerMeta?:    Buffer | Uint8Array; //defults to empty

  accounts: {
    gameAccount:    web3.PublicKey;
    mint:           web3.PublicKey;
    playerAccount:  web3.PublicKey;
    creatorAddress: web3.PublicKey;
  };
}

export const joinGameIx = async (
  provider: AnchorProvider,
  p: JoinGameParams,
) => {
  const program  = getProgram(provider);
  const isNative = p.accounts.mint.equals(WRAPPED_SOL_MINT);

  // PDAs
  const gambaState   = deriveGambaState();
  const metaPda      = deriveMetadataPda(p.accounts.gameAccount);
  const gameTa       = isNative
    ? null
    : deriveEscrowPda(p.accounts.gameAccount);

  const playerAta = isNative
    ? null
    : ata(p.accounts.mint, p.accounts.playerAccount, false);

  const creatorAta = ata(
    p.accounts.mint,
    p.accounts.creatorAddress,
    true,
  );

  // fallback defaults
  const teamIndex = p.team ?? 0;
  const metaBytes = p.playerMeta
    ? Array.from(p.playerMeta)
    : [];

  // Build the instruction
  const ix = await program.methods
    .joinGame(
      p.creatorFeeBps,
      new BN(p.wager),
      teamIndex,
      metaBytes, // [u8;32] or empty
    )
    .accountsPartial({
      gameAccount:      p.accounts.gameAccount,
      metadataAccount:  metaPda,
      gambaState,
      gameAccountTa:    gameTa,
      mint:             p.accounts.mint,
      playerAccount:    p.accounts.playerAccount,
      playerAta,
      creatorAddress:   p.accounts.creatorAddress,
      creatorAta,
    } as any)
    .instruction();

  return ix;
};
