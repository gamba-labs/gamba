import * as SplToken from '@solana/spl-token'
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'
import { GambaProvider, NATIVE_MINT } from 'gamba-core-v2'
import { GambaPlayInput } from './hooks'

export interface GambaPluginInput {
  wallet: PublicKey
  creator: PublicKey
  token: PublicKey
  bet: number[]
  wager: number
  input: GambaPlayInput
}

export type GambaPlugin = (stuff: GambaPluginInput, provider: GambaProvider) => Promise<TransactionInstruction[]> | TransactionInstruction[]

export const createCustomFeePlugin = (
  _receiver: string,
  percent: number,
): GambaPlugin => async (stuff, provider) => {
  const receiver = new PublicKey(_receiver)
  // Send native SOL
  if (stuff.token.equals(NATIVE_MINT)) {
    return [
      SystemProgram.transfer({
        fromPubkey: stuff.wallet,
        toPubkey: receiver,
        lamports: stuff.wager * percent,
      }),
    ]
  }

  const fromAta = SplToken.getAssociatedTokenAddressSync(stuff.token, stuff.wallet)
  const toAta = SplToken.getAssociatedTokenAddressSync(stuff.token, receiver)

  const createAtaInstruction = async () => {
    try {
      await SplToken.getAccount(provider.anchorProvider.connection, toAta)
      // Recipient account exists, return empty
      return []
    } catch (error) {
      if (error instanceof SplToken.TokenAccountNotFoundError || error instanceof SplToken.TokenInvalidAccountOwnerError) {
        // Recipient account doesnt exist, add create instruction
        return [
          SplToken.createAssociatedTokenAccountInstruction(
            stuff.wallet,
            toAta,
            receiver,
            stuff.token,
          ),
        ]
      } else {
        throw error
      }
    }
  }

  // Send SPL token
  return [
    ...(await createAtaInstruction()),
    SplToken.createTransferInstruction(
      fromAta,
      toAta,
      stuff.wallet,
      stuff.wager * percent,
    ),
  ]
}
