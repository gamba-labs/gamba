import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'
import { REFERRAL_IDL, ReferralIdl } from './idl'

// 1) Pull your on‐chain program ID straight from the IDL metadata:
export const PROGRAM_ID = new PublicKey(REFERRAL_IDL.address || REFERRAL_IDL.metadata.address)

// 2) Helper: derive the PDA for [creator, authority]
export function getReferrerPda(
  creator: PublicKey,
  authority: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [creator.toBytes(), authority.toBytes()],
    PROGRAM_ID,
  )[0]
}

/**
 * 3) Build the raw `configReferAccount` instruction.
 */
export function createReferral(
  provider: AnchorProvider,
  creator: PublicKey,
  referrer: PublicKey,
): TransactionInstruction {
  const program = new Program<ReferralIdl>(REFERRAL_IDL, provider)
  const pda = getReferrerPda(creator, provider.wallet.publicKey!)

  return program.instruction.configReferAccount(
    referrer, // arg
    {
      accounts: {
        authority:    provider.wallet.publicKey!,  // signer
        referAccount: pda,                         // PDA to init
        creator,                                   // caller-provided creator
        systemProgram: SystemProgram.programId,    // <— must supply!
      },
    },
  )
}

/**
 * 4) Build the raw `closeReferAccount` instruction.
 */
export function closeReferral(
  provider: AnchorProvider,
  creator: PublicKey,
): TransactionInstruction {
  const program = new Program<ReferralIdl>(REFERRAL_IDL, provider)
  const pda = getReferrerPda(creator, provider.wallet.publicKey!)

  return program.instruction.closeReferAccount({
    accounts: {
      authority:    provider.wallet.publicKey!,  // signer
      referAccount: pda,                         // PDA to close
      creator,                                   // creator
      systemProgram: SystemProgram.programId,    // <— must supply!
    },
  })
}

/**
 * 5) Fetch the on‐chain referral account; return `referrer` or null.
 */
export async function fetchReferral(
  provider: AnchorProvider,
  referAccountPda: PublicKey,
): Promise<PublicKey | null> {
  const program = new Program<ReferralIdl>(REFERRAL_IDL, provider)
  try {
    const acct = await program.account.referAccount.fetch(referAccountPda)
    return acct.referrer
  } catch (err: any) {
    if (err.toString().includes('AccountNotFound')) return null
    throw err
  }
}
