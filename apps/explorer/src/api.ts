import { Connection, PublicKey } from "@solana/web3.js"
import { GambaTransaction, fetchGambaTransactionsFromSignatures } from "gamba-core-v2"

const API_ENDPOINT = import.meta.env.VITE_GAMBA_API_ENDPOINT

export interface DailyVolume {
  total_volume: number
  date: string
}

export interface RatioData {
  date: string
  lp_supply: number
  pool_liquidity: number
}

export const fetchDailyVolume = async (pool: PublicKey) => {
  const res = await window.fetch(API_ENDPOINT + "/daily?pool=" + pool.toBase58(), { headers: { "ngrok-skip-browser-warning": "true" } })
  return await res.json() as DailyVolume[]
}

export const fetchChart = async (pool: PublicKey) => {
  const res = await window.fetch(API_ENDPOINT + "/ratio?pool=" + pool.toBase58(), { headers: { "ngrok-skip-browser-warning": "true" } })
  return await res.json() as RatioData[]
}

export const fetchRecentPlays = async (connection: Connection, pool?: PublicKey) => {
  const e = !pool ? "/events/settledGames?pool=" : "/events/settledGames?pool=" + pool?.toBase58()
  const res = await window.fetch(API_ENDPOINT + e, { headers: { "ngrok-skip-browser-warning": "true" } })
  const { signatures } = await res.json()
  const events = await fetchGambaTransactionsFromSignatures(connection, signatures) as GambaTransaction<"GameSettled">[]
  return events.sort((a, b) => {
    return b.time - a.time
  })
}

export const fetchPoolChanges = async (connection: Connection, pool: PublicKey) => {
  const res = await window.fetch(API_ENDPOINT + "/events/poolChanges?pool=" + pool.toBase58(), { headers: { "ngrok-skip-browser-warning": "true" } })
  const { signatures } = await res.json()
  const events = await fetchGambaTransactionsFromSignatures(connection, signatures)
  return events as GambaTransaction<"PoolChange">[]
}
