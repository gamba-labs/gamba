import { AnchorProvider, web3 } from "@coral-xyz/anchor";
import { getProgram } from "../constants.js";
import { dumpIx } from "../utils/ix-debug.js";

export interface GambaConfigParams {
  gambaFeeAddress : web3.PublicKey;
  gambaFeeBps     : number;
  rng             : web3.PublicKey;
  authority       : web3.PublicKey;
  authoritySigner : web3.PublicKey;
}

export const gambaConfigIx = async (
  provider: AnchorProvider,
  p: GambaConfigParams,
) => {
  const program = getProgram(provider);
  const ix = await program.methods
    .gambaConfig(p.gambaFeeAddress, p.gambaFeeBps, p.rng, p.authority)
    .accounts({ authority: p.authoritySigner })
    .instruction();

  dumpIx(ix, "gambaConfigIx");
  return ix;
};

