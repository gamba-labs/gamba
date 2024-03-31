import { NATIVE_MINT, createAssociatedTokenAccountInstruction, createCloseAccountInstruction, createSyncNativeInstruction } from '@solana/spl-token'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { getUserWsolAccount } from '.'

export const wrapSol = async (
  from: PublicKey,
  amount: bigint | number,
  create: boolean,
) => {
  const wsolAta = getUserWsolAccount(from)

  const instructions = [
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: wsolAta,
      lamports: amount,
    }),
    createSyncNativeInstruction(wsolAta),
  ]

  if (create) {
    return [
      createAssociatedTokenAccountInstruction(
        from,
        wsolAta,
        from,
        NATIVE_MINT,
      ),
      ...instructions,
    ]
  }

  return instructions
}

export const unwrapSol = async (
  from: PublicKey,
) => {
  const wsolAta = getUserWsolAccount(from)
  return createCloseAccountInstruction(
    wsolAta,
    from,
    from,
  )
}
