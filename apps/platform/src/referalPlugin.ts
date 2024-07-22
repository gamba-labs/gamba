import * as SplToken from '@solana/spl-token'
import '@solana/wallet-adapter-react-ui/styles.css'
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js'
import { GambaPlugin } from 'gamba-react-v2'
import { PLATFORM_REFFERAL_FEES } from './constants'
import './styles.css'

/**
 * The instructions returned from this plugin will be executed before gamba's "play" instruction
 */
export const makeReferalPlugin = (
  tokenPercent = Math.min(PLATFORM_REFFERAL_FEES, 0.05) // max 5%
): GambaPlugin => async (input, context) => {
  try {
    const _recipient = window.location.hash.slice(1)
    if (!_recipient) return []

    const recipient = new PublicKey(_recipient)

    // Send native SOL
    if (input.token.equals(SplToken.NATIVE_MINT)) {
      return [
        SystemProgram.transfer({
          fromPubkey: input.wallet,
          toPubkey: recipient,
          lamports: Math.floor(input.wager * tokenPercent),
        }),
      ]
    }

    const fromAta = SplToken.getAssociatedTokenAddressSync(input.token, input.wallet)
    const toAta = SplToken.getAssociatedTokenAddressSync(input.token, recipient)

    const recipientHasAta = await (async () => {
      try {
        await SplToken.getAccount(context.provider.anchorProvider.connection, toAta, 'confirmed')
        // Recipient account exists, return empty
        return true
      } catch (error) {
        if (error instanceof SplToken.TokenAccountNotFoundError || error instanceof SplToken.TokenInvalidAccountOwnerError) {
          // Recipient account doesn't exist, add create instruction
          return false
        } else {
          throw error
        }
      }
    })()

    const instructions = []

    if (!recipientHasAta) {
      instructions.push(
        SplToken.createAssociatedTokenAccountInstruction(
          input.wallet,
          toAta,
          recipient,
          input.token,
        )
      )
    }

    const tokenAmount = BigInt(Math.floor(input.wager * tokenPercent))
    instructions.push(
      SplToken.createTransferInstruction(
        fromAta,
        toAta,
        input.wallet,
        tokenAmount,
      )
    )

    return instructions
  } catch (err) {
    console.error(err)
    return []
  }
}
