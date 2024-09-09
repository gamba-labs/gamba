import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { REFERRAL_IDL } from './idl'

export const PROGRAM_ID = new PublicKey('RefwFk2PPNd9bPehSyAkrkrehSHkvz6mTAHTNe8v9vH')

export const getReferrerPda = (creator: PublicKey, authority: PublicKey) =>
  PublicKey.findProgramAddressSync([
    creator.toBytes(),
    authority.toBytes(),
  ], PROGRAM_ID)[0]

export const createReferral = async (
  provider: AnchorProvider,
  creator: PublicKey,
  referAccount: PublicKey,
) => {
  const referralProgram = new Program(REFERRAL_IDL, PROGRAM_ID, provider)
  return referralProgram.methods
    .configReferAccount(referAccount)
    .accounts({ referAccount: getReferrerPda(creator, provider.wallet.publicKey), creator })
    .instruction()
}

export const closeReferral = async (
  provider: AnchorProvider,
  creator: PublicKey,
) => {
  const referralProgram = new Program(REFERRAL_IDL, PROGRAM_ID, provider)
  return referralProgram.methods
    .closeReferAccount()
    .accounts({ referAccount: getReferrerPda(creator, provider.wallet.publicKey), creator })
    .instruction()
}

export const fetchReferral = async (
  provider: AnchorProvider,
  pda: PublicKey,
) => {
  const referralProgram = new Program(REFERRAL_IDL, PROGRAM_ID, provider)
  const account = await referralProgram.account.referAccount.fetch(pda)
  if (!account) return null
  return account.referrer
}
