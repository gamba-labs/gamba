/**
 * Work in Progress!
 * Since we didn't log anchor events for pool creations,
 * this function will be used to find all pool creation sigs
 */
import { BorshCoder } from '@coral-xyz/anchor'
import { PartiallyDecodedInstruction } from '@solana/web3.js'
import { IDL, PROGRAM_ID } from 'gamba-core-v2'
import { all } from './db'
import { createBatches } from './utils'
import { connection } from './web3'

const coder = new BorshCoder(IDL)

export const findAllPoolCreations = async () => {
  const sigs = (await all('select * from signatures')).map((x) => x.signature)
  const games = (await all('select signature from settled_games')).map((x) => x.signature)
  const changes = (await all('select signature from pool_changes')).map((x) => x.signature)
  const known = new Set([...games, ...changes])

  console.log(sigs[0])
  const unknownSigs = sigs.filter((x) => !known.has(x))
  const batches = createBatches(unknownSigs, 100)

  const stuff: {signature: string, creator: string, poolAddress: string, token: string, time: number}[] = []

  let batchId = 0
  for (const batch of batches) {
    console.log('Batch', batchId, ' / ', batches.length, batch[0])
    const transactions = (await connection.getParsedTransactions(
      batch,
      {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
      },
    )).flatMap((x) => x ? [x] : [])

    for (const tx of transactions) {
      const gambaIx = tx.transaction.message.instructions.find((x) => x.programId.equals(PROGRAM_ID)) as PartiallyDecodedInstruction
      if (gambaIx) {
        const ix = coder.instruction.decode(gambaIx.data, 'base58')
        const accountMetas = tx.transaction.message.accountKeys.map(({ pubkey, signer, writable }) => ({
          pubkey,
          isSigner: signer,
          isWritable: writable,
        }))
        const formatted = coder.instruction.format(ix, accountMetas)
        if (ix.name === 'poolInitialize') {
          console.log('PoolTx', ix, formatted)
        }
      }
    }

    batchId++
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log(stuff.map((x) => x.signature))
}
