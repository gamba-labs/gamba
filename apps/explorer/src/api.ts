import { Connection, PublicKey } from "@solana/web3.js"
import { fetchGambaTransactionsFromSignatures, GambaTransaction } from "gamba-core-v2"

// const API_ENDPOINT = "http://127.0.0.1:4949"
const API_ENDPOINT = "https://bc9f-24-144-90-53.ngrok-free.app"

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
  const events = await fetchGambaTransactionsFromSignatures(connection, signatures)
  return events as GambaTransaction<"GameSettled">[]
}

export const fetchPoolChanges = async (connection: Connection, pool: PublicKey) => {
  const res = await window.fetch(API_ENDPOINT + "/events/poolChanges?pool=" + pool.toBase58(), { headers: { "ngrok-skip-browser-warning": "true" } })
  const { signatures } = await res.json()
  const events = await fetchGambaTransactionsFromSignatures(connection, signatures)
  return events as GambaTransaction<"PoolChange">[]
}
