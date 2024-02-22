import sqlite3 from 'sqlite3'

export const db = new sqlite3.Database('gamba.db')

export const setupDb = () => {
  return db.exec(`
    CREATE TABLE IF NOT EXISTS signatures (
      signature TEXT PRIMARY KEY,
      block_time INTEGER
    );

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
      metadata TEXT,
      nonce INTEGER,
      client_seed TEXT,
      rng_seed TEXT,
      next_rng_seed_hashed TEXT,
      bet TEXT,
      bet_length INTEGER,
      result_number INTEGER,
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
      jackpot_fee INTEGER,
      jackpot INTEGER,
      pool_liquidity INTEGER,
      usd_per_unit REAL
    );
  `)
}

export const all = (
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

export const get = (
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
