import { AnchorProvider, utils as anchorUtils, web3 } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync as ata } from "@solana/spl-token";
import {
  WRAPPED_SOL_MINT, PROGRAM_ID, getProgram,
} from "../constants.js";
import { dumpIx } from "../utils/ix-debug.js";

/*──────────────────────────────────────────────────────────────
  6-a. DISTRIBUTE NATIVE 
────────────────────────────────────────────────────────────────*/
export interface DistributeNativeParams {
  accounts : {
    payer           : web3.PublicKey;
    gameAccount     : web3.PublicKey;
    gambaFeeAddress : web3.PublicKey;
  };
  /** creators & winners – system accounts */
  remaining : web3.PublicKey[];
}

export const distributeNativeIx = async (
  provider: AnchorProvider,
  p: DistributeNativeParams,
) => {
  const program = getProgram(provider);

  const [gambaState] = web3.PublicKey.findProgramAddressSync(
    [anchorUtils.bytes.utf8.encode("GAMBA_STATE")],
    PROGRAM_ID,
  );

  const gameAcc   = await program.account.game.fetch(p.accounts.gameAccount);
  const gameMaker = gameAcc.gameMaker as web3.PublicKey;

  const rem = p.remaining.map(pk => ({
    pubkey: pk, isWritable: true, isSigner: false,
  }));

  const ix = await program.methods
    .distributeNative()
    .accounts({
      payer           : p.accounts.payer,
      gambaState,
      gameAccount     : p.accounts.gameAccount,
      gameMaker,
      gambaFeeAddress : p.accounts.gambaFeeAddress,
    } as any)
    .remainingAccounts(rem)
    .instruction();

  dumpIx(ix, "distributeNativeIx");
  return ix;
};

/*──────────────────────────────────────────────────────────────
  6-b. DISTRIBUTE SPL  (explicit 5 creators / 15 winners)
────────────────────────────────────────────────────────────────*/
export interface DistributeSplParams {
  accounts : {
    payer           : web3.PublicKey;
    gameAccount     : web3.PublicKey;
    gambaFeeAddress : web3.PublicKey;
    mint            : web3.PublicKey;
  };
  creators ?: web3.PublicKey[];   /* max 5  */
  winners  ?: web3.PublicKey[];   /* max 15 */
}

export const distributeSplIx = async (
  provider: AnchorProvider,
  p: DistributeSplParams,
) => {
  const program = getProgram(provider);
  const PROGRAM = program.programId;

  const [escrowPda] = web3.PublicKey.findProgramAddressSync(
    [p.accounts.gameAccount.toBuffer()],
    PROGRAM_ID,
  );
  const feeAta  = ata(p.accounts.mint, p.accounts.gambaFeeAddress);
  const gameAcc = await program.account.game.fetch(p.accounts.gameAccount);

  /* mandatory accounts */
  const accs: Record<string, web3.PublicKey> = {
    payer           : p.accounts.payer,
    gameAccount     : p.accounts.gameAccount,
    gambaFeeAddress : p.accounts.gambaFeeAddress,
    mint            : p.accounts.mint,
    gameAccountTa   : escrowPda,
    gambaFeeAta     : feeAta,
    gameMaker       : gameAcc.gameMaker,
  };

  /* fill creator / winner ATAs */
  const pad = (arr: web3.PublicKey[] | undefined, n: number) => {
    const out = (arr ?? []).slice(0, n);
    while (out.length < n) out.push(PROGRAM);
    return out;
  };
  pad(p.creators, 5).forEach((pk, i) => { accs[`creatorAta${i}`] = pk; });
  pad(p.winners ,15).forEach((pk, i) => { accs[`winnerAta${i}`]  = pk; });

  const ix = await program.methods
    .distributeSpl()
    .accountsPartial(accs as any)
    .instruction();

  dumpIx(ix, "distributeSplIx");
  return ix;
};

/*──────────────────────────────────────────────────────────────
  Smart dispatcher – public surface
────────────────────────────────────────────────────────────────*/
export const distributeIx = (
  provider: AnchorProvider,
  p: DistributeNativeParams | DistributeSplParams,
) =>
  "mint" in p.accounts && !p.accounts.mint.equals(WRAPPED_SOL_MINT)
    ? distributeSplIx(provider, p as DistributeSplParams)
    : distributeNativeIx(provider, p as DistributeNativeParams);
