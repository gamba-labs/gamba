import { ConfirmedSignatureInfo, Connection, PublicKey, SignaturesForAddressOptions } from '@solana/web3.js'
import { BPS_PER_WHOLE, GambaTransaction, PROGRAM_ID, parseGambaTransaction } from 'gamba-core-v2'
import sqlite3 from 'sqlite3'

const VERSION = 17

export const db = new sqlite3.Database('gamba-v' + VERSION + '.db')

const decimalsByMint: Record<string, number> = {}
const priceByMint: Record<string, {lastFetch: number, price: number}> = {}

const needsFetch = (x: string) => {
  if (!priceByMint[x]) return true
  return priceByMint[x].lastFetch < Date.now() - 1000 * 60 * 5
}

const fetchPriceData = async (tokens: string[]) => {
  const tokensToFetch = Array.from(new Set(tokens.filter(needsFetch)))
  if (!tokensToFetch.length) {
    return
  }
  console.log('Fetching token prices', tokensToFetch)
  const req = await fetch(`https://price.jup.ag/v4/price?ids=${tokensToFetch.join(',')}`)
  const res = await req.json()
  const data = res.data as Record<string, {price: number}>

  for (const key of tokensToFetch) {
    if (!data[key]) {
      console.log('‼️ No price data for', key)
    }
    priceByMint[key] = {
      price: data[key]?.price ?? 0,
      lastFetch: Date.now(),
    }
  }
}

export async function fetchGambaTransactions(
  connection: Connection,
  address: PublicKey,
  options: SignaturesForAddressOptions,
) {
  const signatures = await connection.getSignaturesForAddress(address, options, 'confirmed')

  if (!signatures.length) return null

  signatures.sort((a, b) => Number(b.blockTime) - Number(a.blockTime))

  const latest = signatures[0]
  const earliest = signatures[signatures.length - 1]

  const transactions = (await connection.getParsedTransactions(
    signatures.map(({ signature }) => signature),
    {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    },
  )).flatMap((x) => x ? [x] : [])

  const events = transactions.flatMap(parseGambaTransaction)

  return { events, latest, earliest, signatures }
}

interface Meta {
  id: 0
  version: number
  earliest_signature: string | null
  earliest_block_time: number | null
  latest_signature: string | null
  latest_block_time: number | null
}

export const initDb = async () => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pool_changes (
      signature TEXT PRIMARY KEY,
      block_time INTEGER,
      token TEXT,
      pool TEXT,
      user TEXT,
      amount INTEGER,
      lp_supply INTEGER,
      post_liquidity INTEGER,
      usd_per_unit REAL
    );

    CREATE TABLE IF NOT EXISTS settled_games (
      signature TEXT PRIMARY KEY,
      block_time INTEGER,
      creator TEXT,
      user TEXT,
      token TEXT,
      pool TEXT,
      wager INTEGER,
      payout INTEGER,
      multiplier_bps INTEGER,
      creator_fee INTEGER,
      pool_fee INTEGER,
      gamba_fee INTEGER,
      jackpot INTEGER,
      pool_liquidity INTEGER,
      usd_per_unit REAL
    );

    CREATE TABLE IF NOT EXISTS meta (
      id INTEGER PRIMARY KEY,
      version INTEGER,
      earliest_signature STRING,
      earliest_block_time INTEGER,
      latest_signature STRING,
      latest_block_time INTEGER
    );
  `)
}

const getMeta = async () => {
  return new Promise<Meta>((resolve, reject) => {
    db.get(
      'SELECT * FROM meta WHERE id = 0;',
      (error, row: Meta | undefined) => {
        if (error) return reject(error)
        resolve(row || {
          id: 0,
          version: VERSION,
          latest_block_time: null,
          latest_signature: null,
          earliest_block_time: null,
          earliest_signature: null,
        })
      },
    )
  })
}

const storeEvents = async (
  meta: Meta,
  events: (GambaTransaction<'GameSettled'> | GambaTransaction<'PoolChange'>)[],
) => {
  const insertMeta = db.prepare(`
    INSERT OR REPLACE INTO meta (id, version, earliest_signature, earliest_block_time, latest_signature, latest_block_time)
    VALUES ( 0, ?, ?, ?, ?, ? );
  `)

  const insertSettledGames = db.prepare(`
    INSERT INTO settled_games (
      signature,
      block_time,
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
      jackpot,
      pool_liquidity,
      usd_per_unit
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )

  const insertPoolChanges = db.prepare(`
    INSERT INTO pool_changes (signature, block_time, token, pool, user, amount, lp_supply, post_liquidity, usd_per_unit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )

  const tokens = events.map((x) => x.data.tokenMint.toString())

  await fetchPriceData(tokens)

  const getPricePerUnit = (mint: PublicKey) => {
    const price = priceByMint[mint.toBase58()]?.price ?? 0
    const decimals = decimalsByMint[mint.toBase58()] ?? 9
    return price / (10 ** decimals)
  }

  db.serialize(() => {
    insertMeta.run(
      meta.version,
      meta.earliest_signature,
      meta.earliest_block_time,
      meta.latest_signature,
      meta.latest_block_time,
    )

    events.forEach(
      (event) => {
        if (event.name === 'PoolChange') {
          const poolChange = event.data
          insertPoolChanges.run(
            event.signature,
            event.time,
            poolChange.tokenMint.toBase58(),
            poolChange.pool.toBase58(),
            poolChange.user.toBase58(),
            poolChange.amount.toNumber(),
            poolChange.lpSupply.toString(),
            poolChange.postLiquidity.toString(),
            getPricePerUnit(poolChange.tokenMint),
          )
        }

        if (event.name === 'GameSettled') {
          const gameSettled = event.data
          const multiplier = gameSettled.bet[gameSettled.resultIndex.toNumber()]
          const wager = gameSettled.wager.toNumber()
          const payout = wager * (multiplier / BPS_PER_WHOLE)
          insertSettledGames.run(
            event.signature,
            event.time,
            gameSettled.creator.toBase58(),
            gameSettled.user.toBase58(),
            gameSettled.tokenMint.toBase58(),
            gameSettled.pool.toBase58(),
            wager,
            payout,
            multiplier,
            gameSettled.creatorFee.toNumber(),
            gameSettled.poolFee.toNumber(),
            gameSettled.gambaFee.toNumber(),
            gameSettled.jackpotPayoutToUser.toNumber(),
            gameSettled.poolLiquidity.toString(),
            getPricePerUnit(gameSettled.tokenMint),
          )
        }
      },
    )
  })
}

const mutateMeta = (
  prev: Meta,
  earliestCandidate: ConfirmedSignatureInfo,
  latestCandidate: ConfirmedSignatureInfo,
) => {
  const meta = { ...prev }

  if (meta.earliest_block_time === null || earliestCandidate.blockTime < meta.earliest_block_time) {
    meta.earliest_block_time = earliestCandidate.blockTime
    meta.earliest_signature = earliestCandidate.signature
  }

  if (meta.latest_block_time === null || latestCandidate.blockTime > meta.latest_block_time) {
    meta.latest_block_time = latestCandidate.blockTime
    meta.latest_signature = latestCandidate.signature
  }

  return meta
}

async function search(
  connection: Connection,
  meta: Meta,
  earliestSignature?: string,
  latestSignature?: string,
) {
  console.log('Fetching events')

  const data = await fetchGambaTransactions(
    connection,
    PROGRAM_ID,
    {
      limit: 200,
      before: earliestSignature,
      until: latestSignature,
    },
  )

  // End of signatures. Go back to searching from top
  if (!data) {
    await new Promise((resolve) => setTimeout(resolve, 10000))
    // Start from top (undefined) to the most recent fetched signature
    return search(connection, meta, undefined, meta.latest_signature)
  }

  console.log('Found %d events, %d signatures', data.events.length, data.signatures.length)

  const nextMeta = mutateMeta(meta, data.earliest, data.latest)
  await storeEvents(nextMeta, data.events)
  console.log('Stored %d events', data.events.length)

  await new Promise((resolve) => setTimeout(resolve, 1000))

  return await search(connection, nextMeta, data.earliest.signature, latestSignature)
}

export async function sync(rpcEndpoint: string) {
  // Fetch token data
  (
    async () => {
      const req = await fetch('https://cache.jup.ag/tokens')
      const res = await req.json()
      const data = res as {address: string, decimals: number}[]
      for (const x of data) {
        decimalsByMint[x.address] = x.decimals
      }
    }
  )()

  console.log('Done fetching token data')

  const connection = new Connection(rpcEndpoint, { commitment: 'confirmed' })

  await initDb()

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const meta = await getMeta()

  console.log('Earliest signature:', meta.earliest_signature)
  console.log('Latest signature:', meta.latest_signature)

  try {
    await search(connection, meta, meta.earliest_signature)
  } catch (err) {
    console.error('❌ Sync error', err)
    console.log('Retrying sync..')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    sync(rpcEndpoint)
  }
}
