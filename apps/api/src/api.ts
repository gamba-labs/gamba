import express from 'express'
import { z } from 'zod'
import { all, get, validate } from './utils'

const api = express.Router()

const poolChangesSchema = z.object({ query: z.object({ pool: z.string().optional() }) })

const volumeSchema = z.object({ query: z.object({ pool: z.string({}) }) })

const dailyUsdSchema = z.object({ query: z.object({ creator: z.string({}).optional() }) })

const creatorScema = z.object({ query: z.object({ creator: z.string({}) }) })

const ratioSchema = z.object({ query: z.object({ pool: z.string({}) }) })

export const daysAgo = (daysAgo: number) => {
  const now = new Date()
  const then = new Date()
  then.setDate(now.getDate() - daysAgo)
  // then.setHours(0, 0, 0, 0)
  return then.getTime()
}

const settledGamesSchema = z.object({
  query: z.object({
    page: z.string(),
    pool: z.string().optional(),
    creator: z.string().optional(),
    user: z.string().optional(),
  }),
})

// Returns tx signatures of recent pool changes
api.get('/events/poolChanges', validate(poolChangesSchema), async (req, res) => {
  const tx = await all(`
    SELECT signature FROM pool_changes
    WHERE pool = ?
    ORDER BY block_time DESC LIMIT 20;
  `, [req.query.pool])
  const signatures = tx.map((x) => x.signature)
  res.send({ signatures })
})

// Returns tx signatures of recent settled games
api.get('/events/settledGames', validate(settledGamesSchema), async (req, res) => {
  const page = Number(req.query.page) ?? 0
  const tx = await all(
    `
      SELECT signature FROM settled_games
      WHERE 1
      ${req.query.pool ? ' AND pool = :pool' : ''}
      ${req.query.creator ? ' AND creator = :creator' : ''}
      ${req.query.user ? ' AND user = :user' : ''}
      ORDER BY block_time DESC LIMIT 10 OFFSET :offset;
    `,
    {
      ':pool': req.query.pool,
      ':creator': req.query.creator,
      ':user': req.query.user,
      ':offset': page * 10,
    },
    // req.query.pool ? [req.query.pool, page * 50] : [page * 50]
  )
  const signatures = tx.map((x) => x.signature)
  res.send({ signatures })
})

// Returns hourly ratio (LP Price) change of a specific pool
api.get('/ratio', validate(ratioSchema), async (req, res) => {
  const tx = await all(`
    SELECT
      strftime('%Y-%m-%d %H:00', sg.block_time / 1000, 'unixepoch') as date,
      AVG(sg.pool_liquidity) as pool_liquidity,
      AVG(pc.lp_supply) as lp_supply
    FROM
      settled_games sg
    LEFT JOIN
      pool_changes pc ON sg.pool = pc.pool AND pc.block_time = (
          SELECT MAX(block_time)
          FROM pool_changes
          WHERE pool = sg.pool AND block_time <= sg.block_time
      )
    WHERE sg.pool = ?
    AND sg.block_time BETWEEN ? AND ?
    GROUP BY date
    ORDER BY
      sg.block_time;
  `, [req.query.pool, 0, Date.now()])
  res.send(tx)
})

// Returns total volume
api.get('/total', validate(volumeSchema), async (req, res) => {
  const tx = await get(`
    SELECT SUM(wager) as volume
    FROM settled_games
    WHERE pool = ?
    AND block_time BETWEEN ? AND ?
  `, [req.query.pool, 0, Date.now()])
  res.send(tx)
})

// Returns list of platforms sorted by their volume for a specific pool
api.get('/platforms-by-pool', validate(volumeSchema), async (req, res) => {
  const tx = await all(`
    SELECT creator, SUM(wager) as volume
    FROM settled_games
    WHERE pool = ?
    AND block_time BETWEEN ? AND ?
    GROUP BY creator
    ORDER BY volume DESC
  `, [req.query.pool, 0, Date.now()])
  res.send(tx)
})

// Returns top creators by volume in USD
api.get('/top-platforms', async (req, res) => {
  const tx = await all(`
    SELECT creator, SUM(wager * usd_per_unit) as usd_volume
    FROM settled_games
    WHERE block_time BETWEEN ? AND ?
    GROUP BY creator
    ORDER BY usd_volume DESC
  `, [daysAgo(7), Date.now()])
  res.send(tx)
})

// Returns top tokens used by a platform
api.get('/platform-tokens', validate(creatorScema), async (req, res) => {
  const tx = await all(`
    SELECT
      creator,
      SUM(wager * usd_per_unit) as usd_volume,
      SUM(wager) as volume,
      token,
      COUNT(token) AS num_plays
    FROM settled_games
    WHERE creator = ?
    AND block_time BETWEEN ? AND ?
    GROUP BY token
    ORDER BY usd_volume DESC
  `, [req.query.creator, 0, Date.now()])
  res.send(tx)
})

// Returns list of top performing players
api.get('/top-players', async (req, res) => {
  const tx = await all(`
    SELECT user, SUM((payout-wager) * usd_per_unit) as usd_profit, SUM(wager * usd_per_unit) as volume
    FROM settled_games
    WHERE block_time BETWEEN ? AND ?
    GROUP BY user
    ORDER BY usd_profit DESC
  `, [0, Date.now()])
  res.send(tx)
})

// Returns list of top plays by USD profit
api.get('/top-plays', async (req, res) => {
  const tx = await all(`
    SELECT user, (payout-wager) * usd_per_unit as usd_profit, wager * usd_per_unit as usd, multiplier_bps / 10000 as multiplier
    FROM settled_games
    WHERE block_time BETWEEN ? AND ?
    ORDER BY usd_profit DESC
    LIMIT 50
  `, [0, Date.now()])
  res.send(tx)
})

// Returns list of top plays by USD profit
api.get('/status', async (req, res) => {
  const tx = await get(`
    SELECT earliest_signature FROM meta
  `)
  const users = await all(`
    SELECT user FROM settled_games GROUP BY user
  `)

  res.send({
    users,
    syncing: !tx || tx.earliest_signature !== '42oXxibwpHeoX8ZrEhzbfptNAT8wGhpbRA1j7hrnALwZB4ERB1wCFpMTHjMzsfJHeEKxgPEiwwgCWa9fStip8rra', 
  })
})

// Returns daily volume for a specific pool in underlying token
api.get('/daily', validate(volumeSchema), async (req, res) => {
  const tx = await all(`
  SELECT
    strftime('%Y-%m-%d 00:00', block_time / 1000, 'unixepoch') as date,
    SUM(wager) as total_volume
    FROM settled_games
    WHERE pool = ?
    AND block_time BETWEEN ? AND ?
    GROUP BY date
    ORDER BY date ASC
  `, [req.query.pool, 0, Date.now()])
  res.send(tx)
})

// Returns daily volume for USD
api.get('/daily-usd', validate(dailyUsdSchema), async (req, res) => {
  const tx = await all(`
  SELECT
    strftime('%Y-%m-%d 00:00', block_time / 1000, 'unixepoch') as date,
    SUM(wager * usd_per_unit) as total_volume
    FROM settled_games
    WHERE 1
    ${req.query.creator ? 'AND creator = :creator' : ''}
    AND block_time BETWEEN :from AND :until
    GROUP BY date
    ORDER BY date ASC
  `, {
    ':creator': req.query.creator,
    ':from': daysAgo(7),
    ':until': Date.now(),
  })
  res.send(tx)
})

export default api
