import * as anchor from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, TransactionInstruction, Commitment } from '@solana/web3.js'
import * as SplToken from '@solana/spl-token'
import { GambaPlugin } from 'gamba-react-v2'
import { REFERRAL_IDL, ReferralIdl } from './idl'


const PROGRAM_ID = new PublicKey(REFERRAL_IDL.address)

function programFor(provider: anchor.AnchorProvider) {
  return new anchor.Program<ReferralIdl>(REFERRAL_IDL as any, provider)
}

function getReferrerPda(creator: PublicKey, authority: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [creator.toBytes(), authority.toBytes()],
    PROGRAM_ID,
  )[0]
}

async function buildConfigReferIx(
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

async function buildCloseReferIx(
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

export function makeReferralPlugin(
  recipient: PublicKey,
  upsert: boolean,
  referralFee = 0.0025, // 0.25%
  creatorFeeDeduction = 1,
): GambaPlugin {
  return async (input, ctx) => {
    // Accept both shapes
    const anchorProvider: anchor.AnchorProvider =
      (ctx as any).provider?.anchorProvider ?? (ctx as any).provider
    if (!anchorProvider) throw new Error('AnchorProvider missing in referral plugin context')

    const connection = anchorProvider.connection
    const ixs: TransactionInstruction[] = []

    if (upsert) {
      ixs.push(await buildConfigReferIx(anchorProvider, input.creator, recipient))
    }

    const wagerLamports =
      typeof (input as any).wager === 'bigint'
        ? Number((input as any).wager)
        : (input as any).wager as number

    const amountLamports = Math.floor(wagerLamports * referralFee)
    const amountBigint   = BigInt(amountLamports)

    if (input.token.equals(SplToken.NATIVE_MINT)) {
      if (amountLamports > 0) {
        ixs.push(
          SystemProgram.transfer({
            fromPubkey: input.wallet,
            toPubkey: recipient,
            lamports: amountLamports, // number
          }),
        )
      }
    } else {
      const fromAta = SplToken.getAssociatedTokenAddressSync(input.token, input.wallet)
      const toAta   = SplToken.getAssociatedTokenAddressSync(input.token, recipient)

      // Ensure recipient ATA exists
      let exists = true
      try {
        await SplToken.getAccount(connection, toAta, 'confirmed' as Commitment)
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

      if (amountBigint > 0n) {
        ixs.push(
          SplToken.createTransferInstruction(
            fromAta,
            toAta,
            input.wallet,
            amountBigint, // bigint
          ),
        )
      }
    }

    if (typeof (ctx as any).creatorFee === 'number') {
      ;(ctx as any).creatorFee = Math.max(
        0,
        (ctx as any).creatorFee - referralFee * creatorFeeDeduction,
      )
    }

    return ixs
  }
}

export async function buildRemoveReferralIx(
  provider: anchor.AnchorProvider,
  creator: PublicKey,
): Promise<TransactionInstruction> {
  return buildCloseReferIx(provider, creator)
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
