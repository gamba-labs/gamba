import {
  AnchorProvider,
  utils as anchorUtils,
  web3,
} from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync as ata } from "@solana/spl-token";
import {
  WRAPPED_SOL_MINT,
  PROGRAM_ID,
  getProgram,
} from "../constants.js";
import {
  deriveMetadataPda,
  deriveEscrowPda,
} from "../utils/pda.js";

export interface LeaveGameParams {
  accounts: {
    gameAccount:    web3.PublicKey;
    mint:           web3.PublicKey;
    playerAccount:  web3.PublicKey;
  };
}

export const leaveGameIx = async (
  provider: AnchorProvider,
  p: LeaveGameParams,
) => {
  const program  = getProgram(provider);
  const isNative = p.accounts.mint.equals(WRAPPED_SOL_MINT);

  const metaPda  = deriveMetadataPda(p.accounts.gameAccount);
  const gameTa   = isNative
    ? null
    : deriveEscrowPda(p.accounts.gameAccount);

  const playerAta = isNative
    ? null
    : ata(p.accounts.mint, p.accounts.playerAccount, false);

  const ix = await program.methods
    .leaveGame()
    .accountsPartial({
      gameAccount:      p.accounts.gameAccount,
      metadataAccount:  metaPda,
      gameAccountTa:    gameTa,
      mint:             p.accounts.mint,
      playerAccount:    p.accounts.playerAccount,
      playerAta,
    } as any)
    .instruction();

  return ix;
};
