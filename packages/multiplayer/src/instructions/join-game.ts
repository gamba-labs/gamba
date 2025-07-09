import { AnchorProvider, BN, utils as anchorUtils, web3 } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync as ata } from "@solana/spl-token";
import { WRAPPED_SOL_MINT, PROGRAM_ID, getProgram } from "../constants.js";
import { dumpIx } from "../utils/ix-debug.js";

export interface JoinGameParams {
  creatorFeeBps : number;
  wager         : BN | number;
  team          : number;

  accounts : {
    gameAccount    : web3.PublicKey;
    mint           : web3.PublicKey;
    playerAccount  : web3.PublicKey;
    creatorAddress : web3.PublicKey;
  };
}

export const joinGameIx = async (
  provider: AnchorProvider,
  p: JoinGameParams,
) => {
  const program  = getProgram(provider);
  const isNative = p.accounts.mint.equals(WRAPPED_SOL_MINT);

  /* PDAs ------------------------------------------------------ */
  const [gambaState] = web3.PublicKey.findProgramAddressSync(
    [anchorUtils.bytes.utf8.encode("GAMBA_STATE")],
    PROGRAM_ID,
  );

  const creatorAta = ata(p.accounts.mint, p.accounts.creatorAddress, true);
  const playerAta  = isNative ? null : ata(p.accounts.mint, p.accounts.playerAccount);
  const gameTa     = isNative ? null :
    web3.PublicKey.findProgramAddressSync([p.accounts.gameAccount.toBuffer()], PROGRAM_ID)[0];

  const accs: Record<string, web3.PublicKey | null> = {
    gameAccount   : p.accounts.gameAccount,
    gambaState,
    gameAccountTa : gameTa,
    mint          : p.accounts.mint,
    playerAccount : p.accounts.playerAccount,
    playerAta,
    creatorAddress: p.accounts.creatorAddress,
    creatorAta,
  };

  const ix = await program.methods
    .joinGame(p.creatorFeeBps, new BN(p.wager), p.team)
    .accountsPartial(accs as any)
    .instruction();

  dumpIx(ix, "joinGameIx");
  return ix;
};
