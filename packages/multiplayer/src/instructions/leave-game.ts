import {
  AnchorProvider,
  utils as anchorUtils,
  web3,
} from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync as ata } from "@solana/spl-token";
import { WRAPPED_SOL_MINT, PROGRAM_ID, getProgram } from "../constants.js";
import { dumpIx } from "../utils/ix-debug.js";

export interface LeaveGameParams {
  accounts: {
    gameAccount   : web3.PublicKey;
    mint          : web3.PublicKey;
    playerAccount : web3.PublicKey;
  };
}

export const leaveGameIx = async (
  provider: AnchorProvider,
  p: LeaveGameParams,
) => {
  const program  = getProgram(provider);
  const isNative = p.accounts.mint.equals(WRAPPED_SOL_MINT);

  /* ------------------------------------------------------------
     Optional / PDA accounts
  ------------------------------------------------------------ */
  // PDA where the game escrow sits (same seeds as on-chain struct)
  const gameTa = isNative
    ? null
    : web3.PublicKey.findProgramAddressSync(
        [p.accounts.gameAccount.toBuffer()],
        PROGRAM_ID,
      )[0];

  // Player’s associated token account (skip for WSOL/native)
  const playerAta = isNative
    ? null
    : ata(p.accounts.mint, p.accounts.playerAccount);

  /* ------------------------------------------------------------
     Build ix
  ------------------------------------------------------------ */
  const ix = await program.methods
    .leaveGame()
    .accountsPartial({
      gameAccount   : p.accounts.gameAccount,
      gameAccountTa : gameTa,
      mint          : p.accounts.mint,
      playerAccount : p.accounts.playerAccount,
      playerAta,
    } as any)               // allow nulls
    .instruction();

  dumpIx(ix, "leaveGameIx");
  return ix;
};
