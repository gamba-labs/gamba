import { AnchorProvider, web3 } from "@coral-xyz/anchor";
import { getProgram } from "../constants.js";

export interface SelectWinnersParams {
  accounts: {
    rng         : web3.PublicKey;
    gameAccount : web3.PublicKey;
  };
}

export const selectWinnersIx = async (
  provider: AnchorProvider,
  p: SelectWinnersParams,
) => {
  const program = getProgram(provider);
  const ix = await program.methods
    .selectWinners()
    .accounts({
      rng         : p.accounts.rng,
      gameAccount : p.accounts.gameAccount,
    })
    .instruction();

  return ix;
};
