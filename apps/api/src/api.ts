import express, { Request, Response, NextFunction } from 'express'
import { db } from './db'
import { z, AnyZodObject } from 'zod'

const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      return next()
    } catch (error) {
      return res.status(400).json(error)
    }
  }

const all = (
  query: string,
  params?: any,
) => {
  return new Promise<any[]>((resolve, reject) => {
    db.all(query, params,
      (error, rows) => {
        if (error) {
          return reject(error)
        }
        resolve(rows)
      },
    )
  })
}

const get = (
  query: string,
  params?: any,
) => {
  return new Promise<any>((resolve, reject) => {
    db.get(query, params,
      (error, row) => {
        if (error) {
          return reject(error)
        }
        resolve(row)
      },
    )
  })
}

const api = express.Router()

const poolChangesSchema = z.object({ query: z.object({ pool: z.string().optional() }) })

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

const settledSchema = z.object({ query: z.object({ pool: z.string().optional() }) })

// Returns tx signatures of recent settled games
api.get('/events/settledGames', validate(settledSchema), async (req, res) => {
  const tx = await all(`
    SELECT signature FROM settled_games
    WHERE pool = ?
    ORDER BY block_time DESC LIMIT 20;
  `, [req.query.pool])
  const signatures = tx.map((x) => x.signature)
  res.send({ signatures })
})

const volumeSchema = z.object({ query: z.object({ pool: z.string({ required_error: 'Bad' }) }) })

const ratioSchema = z.object({ query: z.object({ pool: z.string({ required_error: 'Bad' }) }) })

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

api.get('/total', validate(volumeSchema), async (req, res) => {
  const tx = await get(`
    SELECT SUM(wager) as volume
    FROM settled_games
    WHERE pool = ?
    AND block_time BETWEEN ? AND ?
  `, [req.query.pool, 0, Date.now()])
  res.send(tx)
})

api.get('/creators-by-pool', validate(volumeSchema), async (req, res) => {
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

api.get('/top-creators', async (req, res) => {
  const tx = await all(`
    SELECT creator, SUM(wager * usd_per_unit) as usd_volume
    FROM settled_games
    WHERE block_time BETWEEN ? AND ?
    GROUP BY creator
    ORDER BY usd_volume DESC
  `, [0, Date.now()])
  res.send(tx)
})

api.get('/daily', validate(volumeSchema), async (req, res) => {
  const tx = await all(`
  SELECT
    strftime('%Y-%m-%d %H:00', block_time / 1000, 'unixepoch') as date,
    SUM(wager) as total_volume
    FROM settled_games
    WHERE pool = ?
    AND block_time BETWEEN ? AND ?
    GROUP BY date
    ORDER BY date ASC
  `, [req.query.pool, 0, Date.now()])
  res.send(tx)
})

export default api
