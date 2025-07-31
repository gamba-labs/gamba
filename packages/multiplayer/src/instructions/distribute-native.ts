// instructions/distribute-native.ts

import { AnchorProvider, web3 } from "@coral-xyz/anchor";
import { getProgram }           from "../constants.js";
import { deriveGambaState, deriveMetadataPda } from "../utils/pda.js";

export interface DistributeNativeParams {
  accounts: {
    payer:           web3.PublicKey;
    gameAccount:     web3.PublicKey;
    gambaFeeAddress: web3.PublicKey;
  };
  remaining: web3.PublicKey[]; // raw creator/winner accounts (system lamport receivers)
}

export const distributeNativeIx = async (
  provider: AnchorProvider,
  p: DistributeNativeParams,
): Promise<web3.TransactionInstruction> => {
  const program         = getProgram(provider);
  const gambaStatePda   = deriveGambaState();
  const metadataAccount = deriveMetadataPda(p.accounts.gameAccount);

  // fetch the gameMaker from on‑chain state
  const rawGame = await program.account.game.fetch(p.accounts.gameAccount);
  const gameMaker = (rawGame as any).gameMaker as web3.PublicKey;

  // remainingAccounts must be provided in the exact order:
  // [ creator1_pk, creator2_pk, …, winner1_pk, winner2_pk, … ]
  const rem = p.remaining.map((pk) => ({
    pubkey:     pk,
    isWritable: true,
    isSigner:   false,
  }));

  const ix = await program.methods
    .distributeNative()
    .accountsPartial({
      payer:           p.accounts.payer,
      gambaState:      gambaStatePda,
      gameAccount:     p.accounts.gameAccount,
      metadataAccount,
      gameMaker,
      gambaFeeAddress: p.accounts.gambaFeeAddress,
    } as any)
    .remainingAccounts(rem)
    .instruction();

  return ix;
};
