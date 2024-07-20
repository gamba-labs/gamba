import * as SplToken from '@solana/spl-token'
import '@solana/wallet-adapter-react-ui/styles.css'
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js'
import { GambaPlugin } from 'gamba-react-v2'
import './styles.css'

/**
 * The instructions returned from this plugin will be executed before gamba's "play" instruction
 */
export const makeReferalPlugin = (
  tokenPercent = 0.1,
  fixedSolFallback = 0.01,
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
          lamports: input.wager * tokenPercent,
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
          // Recipient account doesnt exist, add create instruction
          return false
        } else {
          throw error
        }
      }
    })()

    if (recipientHasAta) {
      // Send SPL Token
      return [
        SplToken.createTransferInstruction(
          fromAta,
          toAta,
          input.wallet,
          BigInt(input.wager) / BigInt(1 / tokenPercent),
        ),
      ]
    }

    // Default to sending a fixed amount of SOL if the recipient doesn't have an ATA
    return [
      SystemProgram.transfer({
        fromPubkey: input.wallet,
        toPubkey: recipient,
        lamports: fixedSolFallback * LAMPORTS_PER_SOL,
      }),
    ]
    // Alternatively: We can open an account for the recipient,
    // however, this allows for an "exploit" where the recipient can close their ATA after each play,
    // allowing them to collect SOL and making the player have to pay more
    // return [
    //   SplToken.createAssociatedTokenAccountInstruction(
    //     input.wallet,
    //     toAta,
    //     recipient,
    //     input.token,
    //   ),
    //   SplToken.createTransferInstruction(
    //     fromAta,
    //     toAta,
    //     input.wallet,
    //     BigInt(input.wager) / BigInt(1 / tokenPercent),
    //   )
    // ]
  } catch (err) {
    console.error(err)
    return []
  }
}
