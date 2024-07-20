import * as SplToken from '@solana/spl-token'
import '@solana/wallet-adapter-react-ui/styles.css'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { GambaPlugin } from 'gamba-react-v2'
import './styles.css'

/**
 * The instructions returned from this plugin will be executed before gamba's "play" instruction
 */
export const makeReferalPlugin = (
  percent = 0.1,
): GambaPlugin => async (input, context) => {
  try {
    const _receiver = window.location.hash.slice(1)
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
  } catch (err) {
    console.error(err)
    return []
  }
}
