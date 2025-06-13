// src/referral/referralPlugin.ts

import { AnchorProvider, Program } from '@coral-xyz/anchor'
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { REFERRAL_IDL, ReferralIdl } from './idl'
import { GambaPlugin } from 'gamba-react-v2'
import * as SplToken from '@solana/spl-token'

// 1) Pull your on-chain program ID straight from the IDL metadata:
export const PROGRAM_ID = new PublicKey(
  REFERRAL_IDL.address,
)

/** 
 * 2) Helper: derive the "referAccount" PDA from [creator, authority] 
 */
function getReferrerPda(
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
 *    No builders, no BN shenanigans—just pass your pubkeys into
 *    the low-level `program.instruction` API.
 */
function buildConfigReferIx(
  provider: AnchorProvider,
  creator: PublicKey,
  referrer: PublicKey,
): TransactionInstruction {
  // instantiate the Anchor Program client
  const program = new Program<ReferralIdl>(
    REFERRAL_IDL,
    provider,
  )

  // derive the PDA
  const pda = getReferrerPda(creator, provider.wallet.publicKey!)

  // produce and return the TxInstruction in one synchronous call
  return program.instruction.configReferAccount(
    referrer, // here’s your publicKey-typed arg
    {
      accounts: {
        authority: provider.wallet.publicKey!,
        referAccount: pda,
        creator,
        systemProgram: SystemProgram.programId,
      },
    },
  )
}

/**
 * 4) Build the raw `closeReferAccount` instruction.
 */
function buildCloseReferIx(
  provider: AnchorProvider,
  creator: PublicKey,
): TransactionInstruction {
  const program = new Program<ReferralIdl>(
    REFERRAL_IDL,
    provider,
  )
  const pda = getReferrerPda(creator, provider.wallet.publicKey!)

  return program.instruction.closeReferAccount({
    accounts: {
      authority: provider.wallet.publicKey!,
      referAccount: pda,
      creator,
      systemProgram: SystemProgram.programId,
    },
  })
}

/**
 * 5) The GambaPlugin factory: called on each "play"
 */
export const makeReferralPlugin = (
  recipient: PublicKey,
  upsert: boolean,
  referralFee = 0.01,
  creatorFeeDeduction = 1,
): GambaPlugin => async (input, context) => {
  const provider = context.provider.anchorProvider!
  const ixs: TransactionInstruction[] = []

  // a) if we need to upsert on-chain first
  if (upsert) {
    ixs.push(buildConfigReferIx(provider, input.creator, recipient))
  }

  // b) now send the referral fee in SOL or SPL
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
      await SplToken.getAccount(context.provider.anchorProvider.connection, toAta, 'confirmed')
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

/**
 * 6) (Optionally) export a helper for removal, if your UI calls it
 */
export function buildRemoveReferralIx(
  provider: AnchorProvider,
  creator: PublicKey,
): TransactionInstruction {
  return buildCloseReferIx(provider, creator)
}

/**
 * 7) And a fetch helper if you need it
 */
export async function fetchReferral(
  provider: AnchorProvider,
  referAccountPda: PublicKey,
): Promise<PublicKey | null> {
  const program = new Program<ReferralIdl>(
    REFERRAL_IDL,
    PROGRAM_ID,
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
