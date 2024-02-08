import { Connection, Keypair, PublicKey } from "@solana/web3.js"
import * as SplToken from "@solana/spl-token"

export const setupSplToken = async (
  connection: Connection,
  toWallet: PublicKey,
  decimals: number,
  amount: number,
  mintKeypair?: Keypair,
) => {
  const fromWallet = new Keypair

  const units = amount * (10 ** decimals)

  console.log("Airdrop", fromWallet.secretKey)

  const airdropTx = await connection.requestAirdrop(fromWallet.publicKey, 1e9 * .1)
  await connection.confirmTransaction(airdropTx, "confirmed")

  // Create new token mint
  const mint = await SplToken.createMint(
    connection,
    fromWallet,
    fromWallet.publicKey,
    null,
    decimals,
    mintKeypair,
  )

  // Get the token account of the fromWallet address, and if it does not exist, create it
  const fromTokenAccount = await SplToken.getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mint,
    fromWallet.publicKey,
  )

  // Get the token account of the toWallet address, and if it does not exist, create it
  const toTokenAccount = await SplToken.getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet)

  // Mint 1 new token to the "fromTokenAccount" account we just created
  let signature = await SplToken.mintTo(
    connection,
    fromWallet,
    mint,
    fromTokenAccount.address,
    fromWallet.publicKey,
    units,
  )
  console.log("mint tx:", signature)

  // Transfer the new token to the "toTokenAccount" we just created
  signature = await SplToken.transfer(
    connection,
    fromWallet,
    fromTokenAccount.address,
    toTokenAccount.address,
    fromWallet.publicKey,
    units,
  )

  console.log({ signature })
}
