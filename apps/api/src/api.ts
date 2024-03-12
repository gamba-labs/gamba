import express from 'express'
import { z } from 'zod'
import { validate } from './utils'
import { all, get } from './db'
import apicache from 'apicache'

const cache = apicache.middleware

const api = express.Router()

const poolChangesSchema = z.object({ query: z.object({ pool: z.string().optional() }) })

const volumeSchema = z.object({ query: z.object({ pool: z.string({}) }) })

const ratioSchema = z.object({ query: z.object({ pool: z.string({}) }) })

export const daysAgo = (daysAgo: number) => {
  const now = new Date()
  const then = new Date()
  then.setDate(now.getDate() - daysAgo)
  then.setHours(1)
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

const statsSchema = z.object({ query: z.object({ creator: z.string().optional(), startTime: z.string({}).optional() }) })

api.get('/pools', async (req, res) => {
  const pools = await all(`
    SELECT
      pool,
      token,
      SUM(amount) as total,
      SUM(amount * usd_per_unit) as total_usd,
      SUM(amount) as total
    FROM
      pool_changes
    WHERE 1
    GROUP BY pool;
  `)
  res.send({ pools })
})

// Returns tx signatures of recent pool changes
api.get('/events/poolChanges', validate(poolChangesSchema), async (req, res) => {
  const results = await all(`
    SELECT
      signature,
      action,
      amount,
      user,
      token,
      pool,
      lp_supply,
      post_liquidity,
      block_time * 1000 as time
    FROM pool_changes
    WHERE pool = ?
    ORDER BY block_time DESC LIMIT 20;
  `, [req.query.pool])
  res.send({ results })
})

// Returns tx signatures of recent settled games
api.get('/events/settledGames', cache('1 minute'), validate(settledGamesSchema), async (req, res) => {
  const page = Number(req.query.page) ?? 0
  const params = {
    ':pool': req.query.pool,
    ':creator': req.query.creator,
    ':user': req.query.user,
  }
  const query = `
    ${req.query.pool ? ' AND pool = :pool' : ''}
    ${req.query.creator ? ' AND creator = :creator' : ''}
    ${req.query.user ? ' AND user = :user' : ''}
  `
  const { total } = await get(`
    SELECT COUNT(*) AS total FROM settled_games;
  `)
  const results = await all(
    `
      SELECT
        signature,
        wager,
        payout,
        user,
        creator,
        token,
        multiplier_bps * 1.0 / 10000 as multiplier,
        block_time * 1000 as time
      FROM settled_games
      WHERE 1
      ${query}
      ORDER BY block_time DESC LIMIT 10 OFFSET :offset;
    `,
    {
      ...params,
      ':offset': page * 10,
    },
    // req.query.pool ? [req.query.pool, page * 50] : [page * 50]
  )
  res.send({ total, results })
})

// Returns hourly ratio (LP Price) change of a specific pool
api.get('/ratio', cache('10 minutes'), validate(ratioSchema), async (req, res) => {
  const tx = await all(`
    SELECT
      strftime('%Y-%m-%d %H:00', sg.block_time, 'unixepoch') as date,
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
    AND sg.block_time * 1000 BETWEEN ? AND ?
    GROUP BY date
    ORDER BY
      sg.block_time;
  `, [
    req.query.pool,
    daysAgo(30),
    Date.now(),
  ])
  res.send(tx)
})

api.get('/chart/plays', cache('5 minutes'), async (req, res) => {
  const tx = await all(`
  SELECT
    strftime('%Y-%m-%d 00:00', block_time, 'unixepoch') as date,
    COUNT(user) as total_volume
    FROM settled_games
    WHERE 1
    AND block_time * 1000 BETWEEN ? AND ?
    GROUP BY date
  `, [daysAgo(300), Date.now()])
  res.send(tx)
})

// Returns daily volume for a specific pool in underlying token
api.get('/daily', cache('5 minutes'), validate(volumeSchema), async (req, res) => {
  const tx = await all(`
  SELECT
    strftime('%Y-%m-%d 00:00', block_time, 'unixepoch') as date,
    SUM(wager) as total_volume
    FROM settled_games
    WHERE pool = ?
    AND block_time * 1000 BETWEEN ? AND ?
    GROUP BY date
    ORDER BY date ASC
  `, [req.query.pool, daysAgo(30), Date.now()])
  res.send(tx)
})

// Returns total volume
api.get('/total', cache('5 minutes'), validate(volumeSchema), async (req, res) => {
  const tx = await get(`
    SELECT SUM(wager) as volume
    FROM settled_games
    WHERE pool = ?
    AND block_time BETWEEN ? AND ?
  `, [req.query.pool, 0, Date.now()])
  res.send(tx)
})

// Returns list of platforms sorted by their volume for a specific pool
api.get('/platforms-by-pool', cache('5 minutes'), validate(volumeSchema), async (req, res) => {
  const tx = await all(`
    SELECT creator, SUM(wager) as volume
    FROM settled_games
    WHERE pool = ?
    AND block_time * 1000 BETWEEN ? AND ?
    GROUP BY creator
    ORDER BY volume DESC
  `, [req.query.pool, 0, Date.now()])
  res.send(tx)
})

const topPlatformsSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
    days: z.string().optional(),
    sortBy: z.string().optional(),
  }),
})

// Returns top creators by volume in USD
api.get('/platforms', cache('5 minutes'), validate(topPlatformsSchema), async (req, res) => {
  const days = Number(req.query.days ?? 7)
  const tx = await all(`
    SELECT
      creator,
      SUM(wager * usd_per_unit) as usd_volume,
      SUM(creator_fee * usd_per_unit) as usd_revenue
    FROM settled_games
    WHERE block_time * 1000 BETWEEN :after AND :until
    GROUP BY creator
    ORDER BY usd_volume DESC
    LIMIT :limit
  `, {
    ':after': daysAgo(days),
    ':until': Date.now(),
    ':limit': Number(req.query.limit ?? 10),
  })
  res.send(tx)
})

const tokensSchema = z.object({ query: z.object({ creator: z.string({}).optional() }) })

// Returns top tokens used by a platform
api.get('/tokens', cache('5 minutes'), validate(tokensSchema), async (req, res) => {
  const tx = await all(`
    SELECT
      creator,
      SUM(wager * usd_per_unit) as usd_volume,
      SUM(wager) as volume,
      token,
      COUNT(token) AS num_plays
    FROM settled_games
    WHERE 1
    ${req.query.creator ? 'AND creator = :creator' : ''}
    AND block_time * 1000 BETWEEN :from AND :until
    GROUP BY token
    ORDER BY usd_volume DESC
  `, {
    ':creator': req.query.creator,
    ':from': 0,
    ':until': Date.now(),
  })
  res.send(tx)
})

const playersSchema = z.object({
  query: z.object({
    creator: z.string({}).optional(),
    token: z.string({}).optional(),
    pool: z.string({}).optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
    sortBy: z.enum(['usd_volume', 'usd_profit', 'token_volume', 'token_profit']).optional(),
    startTime: z.string({}).optional(),
  }),
})

// Returns list of top performing players
api.get('/players', cache('5 minutes'), validate(playersSchema), async (req, res) => {
  const { sortBy = 'usd_profit' } = req.query as Record<string, string>
  const startTime = Number(req.query.startTime ?? 0)
  const limit = Number(req.query.limit ?? 5)
  const offset = Number(req.query.offset ?? 0)
  const singleToken = !!req.query.token || !!req.query.pool

  if (!singleToken && ['token_volume', 'token_profit'].includes(sortBy)) {
    res.status(403).send(`token or pool required to sort by ${sortBy}`)
    return
  }

  if (limit < 1 || limit > 5000) {
    res.status(403).send('Limit must range between 1-5000')
    return
  }

  const players = await all(`
    SELECT
      ${(req.query.token || req.query.pool) ? `
        SUM(wager) as token_volume,
        SUM(payout - wager + jackpot) as token_profit,
      ` : ''}
      user,
      SUM(creator_fee * usd_per_unit) as creator_fees_usd,
      SUM((payout - wager + jackpot) * usd_per_unit) as usd_profit,
      SUM(wager * usd_per_unit) as usd_volume
    FROM settled_games
    WHERE 1
    ${req.query.creator ? 'AND creator = :creator' : ''}
    ${req.query.pool ? 'AND pool = :pool' : ''}
    ${req.query.token ? 'AND token = :token' : ''}
    AND block_time * 1000 BETWEEN :from AND :until
    GROUP BY user
    ORDER BY ${sortBy} DESC
    LIMIT :limit
    OFFSET :offset
  `, {
    ':creator': req.query.creator,
    ':token': req.query.token,
    ':pool': req.query.pool,
    ':from': startTime,
    ':until': Date.now(),
    ':limit': limit,
    ':offset': offset,
  })

  res.send({ players })
})

const topPlaysSchema = z.object({
  query: z.object({
    creator: z.string({}).optional(),
    pool: z.string({}).optional(),
    token: z.string({}).optional(),
    player: z.string({}).optional(),
    orderBy: z.enum(['multiplier', 'usd_profit']).optional(),
    sorting: z.enum(['ASC', 'DESC']).optional(),
  }),
})

// Returns list of top plays by USD profit
api.get('/top-plays', cache('5 minutes'), validate(topPlaysSchema), async (req, res) => {
  const tx = await all(`
    SELECT
      signature,
      user,
      token,
      (payout - wager + jackpot) * usd_per_unit as usd_profit,
      (payout - wager + jackpot) as profit,
      jackpot,
      wager * usd_per_unit as usd_wager,
      multiplier_bps / 10000 as multiplier
    FROM settled_games
    WHERE block_time * 1000 BETWEEN :from AND :until
    ${req.query.player ? 'AND user = :player' : ''}
    ${req.query.creator ? 'AND creator = :creator' : ''}
    ${req.query.pool ? 'AND pool = :pool' : ''}
    ${req.query.token ? 'AND token = :token' : ''}
    ORDER BY usd_profit DESC
    LIMIT 50
  `, {
    ':creator': req.query.creator,
    ':player': req.query.player,
    ':pool': req.query.pool,
    ':token': req.query.token,
    ':from': 0,
    ':until': Date.now(),
  })

  res.send(tx)
})

api.get('/status', async (req, res) => {
  const earliestSignature = await get(`
    SELECT signature FROM signatures order by block_time asc
  `)

  res.send({ syncing: !earliestSignature || earliestSignature.signature !== '42oXxibwpHeoX8ZrEhzbfptNAT8wGhpbRA1j7hrnALwZB4ERB1wCFpMTHjMzsfJHeEKxgPEiwwgCWa9fStip8rra' })
})

api.get('/stats', cache('10 minutes'), validate(statsSchema), async (req, res) => {
  const startTime = Number(req.query.startTime ?? 0)
  const params = { ':creator': req.query.creator, ':from': startTime, ':until': Date.now() }
  const creatorQuery = `
    ${req.query.creator ? 'AND creator = :creator' : ''}
    AND block_time * 1000 BETWEEN :from AND :until
  `

  const { active_players } = await get(`
    SELECT COUNT(DISTINCT user) as active_players FROM settled_games
    WHERE 1 ${creatorQuery}
    AND block_time > strftime('%s', 'now', '-1 hours');
  `, params)

  const { players } = await get(`
    SELECT COUNT(DISTINCT user) as players FROM settled_games
    WHERE 1 ${creatorQuery}
  `, params)

  const firstBet = await get(`
    SELECT block_time * 1000 as time FROM settled_games WHERE 1 ${creatorQuery} ORDER BY block_time ASC LIMIT 1
  `, params)

  const { usd_volume, plays } = await get(`
    SELECT COUNT(*) AS plays, SUM(wager * usd_per_unit) as usd_volume FROM settled_games
    WHERE 1 ${creatorQuery}
  `, params)

  const { creators } = await get(`
    SELECT COUNT(DISTINCT creator) as creators FROM settled_games
    WHERE 1 ${creatorQuery}
  `, params)

  const { revenue_usd, player_net_profit_usd } = await get(`
    SELECT
      SUM(creator_fee * usd_per_unit) as revenue_usd,
      SUM((payout - wager - gamba_fee - pool_fee) * usd_per_unit) as player_net_profit_usd
      FROM settled_games
      WHERE 1
      ${req.query.creator ? 'AND creator = :creator' : ''}
      AND block_time * 1000 BETWEEN :from AND :until
    `, {
    ':creator': req.query.creator,
    ':from': daysAgo(99999),
    ':until': Date.now(),
  })

  res.send({
    players,
    usd_volume,
    plays,
    creators,
    revenue_usd,
    player_net_profit_usd,
    active_players,
    first_bet_time: firstBet?.time ?? 0,
  })
})

const dailyUsdSchema = z.object({ query: z.object({ creator: z.string({}).optional() }) })

// Returns daily volume for USD
api.get('/chart/daily-usd', cache('5 minutes'), validate(dailyUsdSchema), async (req, res) => {
  const tx = await all(`
  SELECT
    strftime('%Y-%m-%d 00:00', block_time, 'unixepoch') as date,
    SUM(wager * usd_per_unit) as total_volume
    FROM settled_games
    WHERE 1
    ${req.query.creator ? 'AND creator = :creator' : ''}
    AND block_time * 1000 BETWEEN :from AND :until
    GROUP BY date
    ORDER BY date ASC
  `, {
    ':creator': req.query.creator,
    ':from': daysAgo(6),
    ':until': Date.now(),
  })
  res.send(tx)
})

api.get('/chart/dao-usd', cache('5 minutes'), async (req, res) => {
  const tx = await all(`
  SELECT
    strftime('%Y-%m-%d 00:00', block_time, 'unixepoch') as date,
    SUM(gamba_fee * usd_per_unit) as total_volume
    FROM settled_games
    WHERE 1
    ${req.query.creator ? 'AND creator = :creator' : ''}
    AND block_time * 1000 BETWEEN :from AND :until
    GROUP BY date
    ORDER BY date ASC
  `, {
    ':creator': req.query.creator,
    ':from': daysAgo(30),
    ':until': Date.now(),
  })
  res.send(tx)
})

export default api
