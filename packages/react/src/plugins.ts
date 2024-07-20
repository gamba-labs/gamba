import * as SplToken from '@solana/spl-token'
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'
import { GambaProvider } from 'gamba-core-v2'
import { GambaPlayInput } from './hooks'

export interface GambaPluginInput {
  wallet: PublicKey
  creator: PublicKey
  token: PublicKey
  bet: number[]
  wager: number
  input: GambaPlayInput
}

export type GambaPluginOutput = TransactionInstruction[]

export interface GambaPluginContext {
  creatorFee: number
  provider: GambaProvider
}

export type GambaPlugin = (input: GambaPluginInput, context: GambaPluginContext) => Promise<GambaPluginOutput> | GambaPluginOutput

export const createCustomFeePlugin = (
  _receiver: string | PublicKey,
  percent: number,
): GambaPlugin => async (input, context) => {
  const receiver = new PublicKey(_receiver)
  // Send native SOL
  if (input.token.equals(SplToken.NATIVE_MINT)) {
    return [
      SystemProgram.transfer({
        fromPubkey: input.wallet,
        toPubkey: receiver,
        lamports: input.wager * percent,
      }),
    ]
  }

  const fromAta = SplToken.getAssociatedTokenAddressSync(input.token, input.wallet)
  const toAta = SplToken.getAssociatedTokenAddressSync(input.token, receiver)

  const createAtaInstruction = async () => {
    try {
      await SplToken.getAccount(context.provider.anchorProvider.connection, toAta, 'confirmed')
      // Recipient account exists, return empty
      return []
    } catch (error) {
      if (error instanceof SplToken.TokenAccountNotFoundError || error instanceof SplToken.TokenInvalidAccountOwnerError) {
        // Recipient account doesnt exist, add create instruction
        return [
          SplToken.createAssociatedTokenAccountInstruction(
            input.wallet,
            toAta,
            receiver,
            input.token,
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
      input.wallet,
      BigInt(input.wager) / BigInt(1 / percent),
    ),
  ]
}
