// instructions/distribute-spl.ts

import { AnchorProvider, web3 } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync as getAta } from "@solana/spl-token";
import { getProgram }                from "../constants.js";
import {
  deriveGambaState,
  deriveMetadataPda,
  deriveEscrowPda,
} from "../utils/pda.js";

export interface DistributeSplParams {
  accounts: {
    payer:           web3.PublicKey;
    gameAccount:     web3.PublicKey;
    gambaFeeAddress: web3.PublicKey;
    mint:            web3.PublicKey;
  };
  creators?: web3.PublicKey[];  // ≤ 5 raw owner keys
  winners?:  web3.PublicKey[];  // ≤ 15 raw owner keys
}

export const distributeSplIx = async (
  provider: AnchorProvider,
  p: DistributeSplParams,
): Promise<web3.TransactionInstruction> => {
  const program         = getProgram(provider);
  const gambaStatePda   = deriveGambaState();
  const metadataAccount = deriveMetadataPda(p.accounts.gameAccount);
  const gameAccountTa   = deriveEscrowPda(p.accounts.gameAccount);
  const gambaFeeAta     = getAta(p.accounts.mint, p.accounts.gambaFeeAddress);

  // fetch gameMaker
  const rawGame   = await program.account.game.fetch(p.accounts.gameAccount);
  const gameMaker = (rawGame as any).gameMaker as web3.PublicKey;

  // Build the full account map.  We'll explicitly set
  // ALL 20 optional ATA slots—either to an ATA or to null.
  const accs: Record<string, web3.PublicKey | null> = {
    payer:           p.accounts.payer,
    gambaState:      gambaStatePda,
    gameAccount:     p.accounts.gameAccount,
    metadataAccount,
    gameAccountTa,
    mint:            p.accounts.mint,
    gambaFeeAta,
    gambaFeeAddress: p.accounts.gambaFeeAddress,
    gameMaker,
  };

  // Helper to fill an ATA slot or null
  function setAtaSlot(
    slot: string,
    ownerKey: web3.PublicKey | undefined,
  ) {
    accs[slot] = ownerKey
      ? getAta(p.accounts.mint, ownerKey)
      : null;
  }

  // creators → creatorAta0 … creatorAta4
  for (let i = 0; i < 5; i++) {
    setAtaSlot(`creatorAta${i}`, p.creators?.[i]);
  }

  // winners → winnerAta0 … winnerAta14
  for (let i = 0; i < 15; i++) {
    setAtaSlot(`winnerAta${i}`, p.winners?.[i]);
  }

  // Now that every optional slot is _present_ (maybe null),
  // the builder will accept it and replace nulls with the sentinel.
  const ix = await program.methods
    .distributeSpl()
    .accountsPartial(accs as any)
    .instruction();

  return ix;
};
