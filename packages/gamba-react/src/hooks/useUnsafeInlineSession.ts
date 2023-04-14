import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { useConnection } from '@solana/wallet-adapter-react'
import { Keypair, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { useGambaSession } from './useSession'
import { useMemo } from 'react'
import { GambaError, LAMPORTS_PER_SOL } from 'gamba-core'

const createInlineWallet = (keypair: Keypair) => {
  const wallet = new NodeWallet(keypair)

  return wallet
}

export function useUnsafeInlineSession() {
  const { session: mainSession } = useGambaSession('main')
  const inline = useGambaSession('quick')
  const { connection } = useConnection()

  const inlineWallet = useMemo(() => createInlineWallet(Keypair.generate()), [])

  const create = async (lamports: number) => {
    if (!mainSession) throw new Error('NO_CREATE')
    const session = await inline.create(inlineWallet)

    await session.wallet.waitForState(
      (state) => {
        if (state.info) {
          return { result: true }
        }
      },
    )

    if (session.wallet.info?.lamports && session.wallet.info.lamports < lamports) {
      const diff = lamports - session.wallet.info.lamports
      console.debug('Difference', lamports, session.wallet.info.lamports, diff)
      const blockhash = (await connection.getLatestBlockhash()).blockhash
      const messageV0 = new TransactionMessage({
        payerKey: mainSession.wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: [
          SystemProgram.transfer({
            fromPubkey: mainSession.wallet.publicKey,
            toPubkey: inlineWallet.publicKey,
            lamports: diff,
          }),
        ],
      }).compileToV0Message()

      const transaction = new VersionedTransaction(messageV0)
      const signedTransaction = await mainSession._wallet.signTransaction(transaction)
      const txId = await connection.sendTransaction(signedTransaction)

      await session.wallet.waitForState(
        (state) => {
          if (state.info && state.info.lamports > lamports * .9) {
            return { result: true }
          }
        },
      )
    }

    if (!session.user.state?.created) {
      const res = await session.createUserAccount()
      await res.result()
    }

    return session
  }

  const withdraw = async () => {
    if (!mainSession) throw new Error('NO_CREATE')
    if (!inline.session?.wallet?.info) throw new Error('NO_INLINE_SESSION')
    console.debug('Withdrawing')

    const userLamps = inline.session.user.info?.lamports ?? 0

    if (userLamps > 0) {
      console.debug('Withdrawing from User', userLamps)
      const request = await inline.session.withdraw(userLamps)
      console.debug('...')
      const result = await request.result()
      console.debug('Withdrew from User', result)
    }

    const blockhash = (await connection.getLatestBlockhash()).blockhash
    console.debug('Withdrawing from Wallet', inline.session.wallet.info.lamports)
    const rent = 0.005 * LAMPORTS_PER_SOL //  await connection.getMinimumBalanceForRentExemption()
    const messageV0 = new TransactionMessage({
      payerKey: inlineWallet.publicKey,
      recentBlockhash: blockhash,
      instructions: [
        SystemProgram.transfer({
          fromPubkey: inlineWallet.publicKey,
          toPubkey: mainSession.wallet.publicKey,
          lamports: inline.session.wallet.info.lamports - rent,
        }),
      ],
    }).compileToV0Message()

    const transaction = new VersionedTransaction(messageV0)
    const signedTransaction = await inlineWallet.signTransaction(transaction)
    console.debug('Transfer Signed')
    const txId = await connection.sendTransaction(signedTransaction)
    console.debug('Transfer sent', txId)
  }

  const play = async (config: number[], wager: number) => {
    if (!inline.session) {
      throw new Error(GambaError.PLAY_WITHOUT_CONNECTED)
    }
    return await inline.session.play(config, wager, 'INLINE')
  }

  return { session: inline.session, play, create, withdraw }
}
