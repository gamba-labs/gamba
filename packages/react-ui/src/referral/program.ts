import * as anchor from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'
import { REFERRAL_IDL, ReferralIdl } from './idl'

// You do need this to derive PDAs, but **not** for Program()
const PROGRAM_PUBKEY = new PublicKey(REFERRAL_IDL.address)

/**
 * Derive the PDA for [creator, authority]
 */
export function getReferrerPda(
  creator: PublicKey,
  authority: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [creator.toBytes(), authority.toBytes()],
    PROGRAM_PUBKEY,
  )[0]
}

/**
 * Build the `configReferAccount` instruction using the Anchor builder:
 *   new Program(idl, provider)
 */
export function createReferral(
  provider: anchor.AnchorProvider,
  creator: PublicKey,
  referrer: PublicKey,
): TransactionInstruction {
  const program = new anchor.Program<ReferralIdl>(
    REFERRAL_IDL,
    provider,               // <-- provider only, not program id
  )
  const pda = getReferrerPda(creator, provider.wallet.publicKey!)

  return program.methods
    .configReferAccount(referrer)
    .accountsPartial({
      authority: provider.wallet.publicKey!,  // signer
      referAccount: pda,                         // PDA
      creator,                                   // passed in
      systemProgram: SystemProgram.programId,    // must supply
    })
    .instruction()
}

/**
 * Build the `closeReferAccount` instruction analogously.
 */
export function closeReferral(
  provider: anchor.AnchorProvider,
  creator: PublicKey,
): TransactionInstruction {
  const program = new anchor.Program<ReferralIdl>(
    REFERRAL_IDL,
    provider,
  )
  const pda = getReferrerPda(creator, provider.wallet.publicKey!)

  return program.methods
    .closeReferAccount()
    .accountsPartial({
      authority: provider.wallet.publicKey!,
      referAccount: pda,
      creator,
      systemProgram: SystemProgram.programId,
    })
    .instruction()
}

/**
 * Fetch on-chain state. Returns `referrer` or null if missing.
 */
export async function fetchReferral(
  provider: anchor.AnchorProvider,
  referAccountPda: PublicKey,
): Promise<PublicKey | null> {
  const program = new anchor.Program<ReferralIdl>(
    REFERRAL_IDL,
    provider,
  )
  try {
    const acct = await program.account.referAccount.fetch(referAccountPda)
    return acct.referrer
  } catch (err: any) {
    if (err.toString().includes('AccountNotFound')) return null
    throw err
  }
}
