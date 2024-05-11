import { GambaTransaction, PROGRAM_ID, parseGambaTransaction } from 'gamba-core-v2'
import { all, db, get, setupDb } from './db'
import { getPrices } from './price'
import { createBatches, getResultNumber } from './utils'
import { connection } from './web3'

interface SignatureObject {
  signature: string
  block_time: number
}

/**
 * Recursively fetch signatures until "earliest" is reached,
 * or until there are no more signatures to fetch
 */
const getSignatures = async (
  before?: SignatureObject,
  until?: SignatureObject,
  batch: SignatureObject[] = [],
): Promise<SignatureObject[]> => {
  console.log('Searching signatures before %d until %d Batch: (%d)', before?.block_time, until?.block_time, batch.length)
  const signatures = await connection.getSignaturesForAddress(
    PROGRAM_ID,
    {
      limit: 1000,
      before: before?.signature,
      until: until?.signature,
    },
    'confirmed',
  )

  if (!signatures.length) {
    return batch
  }

  const sigs = signatures
    .map((x) => ({ block_time: x.blockTime, signature: x.signature }))

  // console.log('Signaturses:', sigs.map((x) => x.signature + '-' + x.block_time))
  until && console.log('Until:', until.signature + '-' + until.block_time)
  const nextBatch = [...batch, ...sigs].sort((a, b) => a.block_time - b.block_time)

  const nextBefore = nextBatch[0]

  if (nextBefore === before) {
    return nextBatch
  }

  await new Promise((resolve) => setTimeout(resolve, 100))

  return await getSignatures(
    nextBefore,
    until,
    nextBatch,
  )
}

/**
 * Returns unpopulated signatures
 */
const getRemainingSignatures = async () => {
  const latestGame = await get('select signature, block_time from settled_games order by block_time desc')
  const latestPoolChange = await get('select signature, block_time from pool_changes order by block_time desc')
  const latest = (latestGame?.block_time > latestPoolChange?.block_time ? latestGame?.block_time : latestPoolChange?.block_time) ?? 0

  console.log('Latest blocktime', latest)

  const remaining = await all('select * from signatures WHERE block_time >= :latest', { ':latest': latest })

  return remaining as SignatureObject[]
}

const storeEvents = async (events: (GambaTransaction<'GameSettled'> | GambaTransaction<'PoolChange'>)[]) => {
  const prices = await getPrices(events.map((x) => x.data.tokenMint.toString()))

  const insertGames = db.prepare(`
    INSERT OR IGNORE INTO settled_games (
      signature,
      block_time,
      metadata,
      nonce,
      client_seed,
      rng_seed,
      next_rng_seed_hashed,
      bet,
      bet_length,
      result_number,
      creator,
      user,
      token,
      pool,
      wager,
      payout,
      multiplier_bps,
      creator_fee,
      pool_fee,
      gamba_fee,
      jackpot_fee,
      jackpot,
      pool_liquidity,
      usd_per_unit
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  )

  const insertPoolChanges = db.prepare(`
    INSERT OR IGNORE INTO pool_changes (signature, block_time, action, token, pool, user, amount, lp_supply, post_liquidity, usd_per_unit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )

  for (const event of events) {
    if (event.name === 'PoolChange') {
      insertPoolChanges.run(
        event.signature,
        Math.floor(event.time / 1000),
        event.data.action.deposit ? 'deposit' : 'withdraw',
        event.data.tokenMint.toString(),
        event.data.pool.toString(),
        event.data.user.toString(),
        event.data.amount.toString(),
        event.data.lpSupply.toString(),
        event.data.postLiquidity.toString(),
        prices[event.data.tokenMint.toString()].usdPerUnit,
      )
    }
    if (event.name === 'GameSettled') {
      insertGames.run(
        event.signature,
        Math.floor(event.time / 1000),
        event.data.metadata,
        event.data.nonce.toString(),
        event.data.clientSeed,
        event.data.rngSeed,
        event.data.nextRngSeedHashed,
        JSON.stringify(event.data.bet),
        event.data.bet.length,
        await getResultNumber(event.data.rngSeed, event.data.clientSeed, event.data.nonce),
        event.data.creator.toString(),
        event.data.user.toString(),
        event.data.tokenMint.toString(),
        event.data.pool.toString(),
        event.data.wager.toString(),
        event.data.payout.toString(),
        event.data.multiplierBps.toString(),
        event.data.creatorFee.toString(),
        event.data.poolFee.toString(),
        event.data.gambaFee.toString(),
        event.data.jackpotFee.toString(),
        event.data.jackpotPayoutToUser.toString(),
        event.data.poolLiquidity.toString(),
        prices[event.data.tokenMint.toString()].usdPerUnit,
      )
    }
  }
}

const fetchAndStoreEventsFromSignatures = async (signatures: string[]) => {
  const signatureBatches = createBatches(signatures, 100)

  for (const batch of signatureBatches) {
    const attempt = async (attempts = 0): Promise<(GambaTransaction<'GameSettled'> | GambaTransaction<'PoolChange'>)[]> => {
      try {
        const transactions = (await connection.getParsedTransactions(
          batch,
          {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed',
          },
        )).flatMap((x) => x ? [x] : [])

        return transactions.flatMap(parseGambaTransaction)
      } catch {
        console.log('Retrying... %d', attempts)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
        return attempt(attempts + 1)
      }
    }

    const events = await attempt()

    events.length && console.log('Storing %d events', events.length)

    storeEvents(events)
  }
}

/**
 * Recursively search for signatures,
 * Then populate the new signatures and store in Sqlite db.
 */
const search = async () => {
  const remainingSignatures = await getRemainingSignatures()
  console.log('Remaining signatures %d', remainingSignatures.length)
  // Sort ascending, so we start fetching events from the first to last
  remainingSignatures.sort((a, b) => a.block_time - b.block_time)
  //
  await fetchAndStoreEventsFromSignatures(remainingSignatures.map((x) => x.signature))

  await new Promise((resolve) => setTimeout(resolve, 30000))

  const lastStoredSignature = await get('SELECT * from signatures order by block_time desc') as SignatureObject | null

  const newSignatures = await getSignatures(undefined, lastStoredSignature)

  newSignatures.length && console.log('Found %d signatures', newSignatures.length)

  const insertSignatures = db.prepare('INSERT OR IGNORE INTO signatures (signature, block_time) VALUES (?, ?)')

  for (const sig of newSignatures) {
    insertSignatures.run(sig.signature, sig.block_time)
  }

  newSignatures.length && console.log('Stored %d signatures', newSignatures.length)

  await search()
}

export async function sync() {
  try {
    await setupDb()
    await new Promise((resolve) => setTimeout(resolve, 10))
    await search()
  } catch (err) {
    console.error('❌ Sync error', err)
    console.log('Retrying sync..')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    sync()
  }
}
