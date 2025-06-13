// src/referral/referralPlugin.ts

import * as anchor from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'
import * as SplToken from '@solana/spl-token'
import { GambaPlugin } from 'gamba-react-v2'
import { REFERRAL_IDL, ReferralIdl } from './idl'

// —————————————————————————
// 1) Pull your on-chain program ID from the IDL metadata (for PDAs only)
// —————————————————————————
const PROGRAM_ID = new PublicKey(REFERRAL_IDL.address)

/** Derive the referAccount PDA from [creator, authority] */
function getReferrerPda(
  creator: PublicKey,
  authority: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [creator.toBytes(), authority.toBytes()],
    PROGRAM_ID,
  )[0]
}

/** Build the `configReferAccount` instruction via the Anchor builder */
function buildConfigReferIx(
  provider: anchor.AnchorProvider,
  creator: PublicKey,
  referrer: PublicKey,
): TransactionInstruction {
  const program = new anchor.Program<ReferralIdl>(
    REFERRAL_IDL,
    provider, // ← only provider, no PROGRAM_ID here
  )
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

/** Build the `closeReferAccount` instruction via the Anchor builder */
function buildCloseReferIx(
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
 * 5) GambaPlugin factory: runs on each play
 */
export function makeReferralPlugin(
  recipient: PublicKey,
  upsert: boolean,
  referralFee = 0.01,
  creatorFeeDeduction = 1,
): GambaPlugin {
  return async (input, context) => {
    const provider = context.provider.anchorProvider!
    const ixs: TransactionInstruction[] = []

    // a) optionally upsert the referAccount on-chain
    if (upsert) {
      ixs.push(buildConfigReferIx(provider, input.creator, recipient))
    }

    // b) send the referral fee (SOL or SPL)
    const amount = BigInt(Math.floor(input.wager * referralFee))
    if (input.token.equals(SplToken.NATIVE_MINT)) {
      ixs.push(
        SystemProgram.transfer({
          fromPubkey: input.wallet,
          toPubkey: recipient,
          lamports: amount,
        }),
      )
    } else {
      const fromAta = SplToken.getAssociatedTokenAddressSync(input.token, input.wallet)
      const toAta   = SplToken.getAssociatedTokenAddressSync(input.token, recipient)

      // ensure the recipient ATA exists
      let exists = true
      try {
        await SplToken.getAccount(context.connection, toAta, 'confirmed')
      } catch (err: any) {
        if (
          err instanceof SplToken.TokenAccountNotFoundError ||
          err instanceof SplToken.TokenInvalidAccountOwnerError
        ) {
          exists = false
        } else {
          throw err
        }
      }
      if (!exists) {
        ixs.push(
          SplToken.createAssociatedTokenAccountInstruction(
            input.wallet,
            toAta,
            recipient,
            input.token,
          ),
        )
      }

      ixs.push(
        SplToken.createTransferInstruction(
          fromAta,
          toAta,
          input.wallet,
          amount,
        ),
      )
    }

    // c) adjust the creator fee so the user isn’t over-charged
    context.creatorFee = Math.max(
      0,
      context.creatorFee - referralFee * creatorFeeDeduction,
    )

    return ixs
  }
}

/** Helper for “Remove invite” in your UI */
export function buildRemoveReferralIx(
  provider: anchor.AnchorProvider,
  creator: PublicKey,
): TransactionInstruction {
  return buildCloseReferIx(provider, creator)
}

/** Fetch the on-chain referAccount state (returns the referrer or null) */
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
