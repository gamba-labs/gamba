import * as anchor from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'
import { REFERRAL_IDL, ReferralIdl } from './idl'

const PROGRAM_PUBKEY = new PublicKey(REFERRAL_IDL.address)

// Anchor 0.31: Program(idl, provider)
function programFor(provider: anchor.AnchorProvider) {
  return new anchor.Program<ReferralIdl>(REFERRAL_IDL as any, provider)
}

export function getReferrerPda(
  creator: PublicKey,
  authority: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [creator.toBytes(), authority.toBytes()],
    PROGRAM_PUBKEY,
  )[0]
}

export async function createReferral(
  provider: anchor.AnchorProvider,
  creator: PublicKey,
  referrer: PublicKey,
): Promise<TransactionInstruction> {
  const program = programFor(provider)
  const pda = getReferrerPda(creator, provider.wallet.publicKey!)
  return program.methods
    .configReferAccount(referrer)
    .accountsPartial({
      authority: provider.wallet.publicKey!,
      referAccount: pda,
      creator,
      systemProgram: SystemProgram.programId,
    })
    .instruction()
}

export async function closeReferral(
  provider: anchor.AnchorProvider,
  creator: PublicKey,
): Promise<TransactionInstruction> {
  const program = programFor(provider)
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

export async function fetchReferral(
  provider: anchor.AnchorProvider,
  referAccountPda: PublicKey,
): Promise<PublicKey | null> {
  const program = programFor(provider)
  try {
    const acct = await program.account.referAccount.fetch(referAccountPda)
    return (acct as any).referrer as PublicKey
  } catch (err: any) {
    if (String(err).includes('AccountNotFound')) return null
    throw err
  }
}
