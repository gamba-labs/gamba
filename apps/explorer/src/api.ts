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

export interface TopCreatorsData {
  creator: string
  usd_volume: number
}

export const fetchDailyVolume = async (pool: PublicKey) => {
  const res = await window.fetch(API_ENDPOINT + "/daily?pool=" + pool.toBase58(), { headers: { "ngrok-skip-browser-warning": "true" } })
  return await res.json() as DailyVolume[]
}

export const fetchStatus = async () => {
  const res = await window.fetch(API_ENDPOINT + "/status", { headers: { "ngrok-skip-browser-warning": "true" } })
  return await res.json() as {syncing: boolean}
}

export const fetchDailyTotalVolume = async () => {
  const res = await window.fetch(API_ENDPOINT + "/daily-usd", { headers: { "ngrok-skip-browser-warning": "true" } })
  return await res.json() as DailyVolume[]
}

export interface TopPlayersResponse {
  user: string
  usd_profit: number
  volume: number
}

export const fetchTopPlayers = async () => {
  const res = await window.fetch(API_ENDPOINT + "/top-players", { headers: { "ngrok-skip-browser-warning": "true" } })
  return await res.json() as TopPlayersResponse[]
}

export const fetchTokensForPlatform = async (creator: string | PublicKey) => {
  const res = await window.fetch(API_ENDPOINT + "/platform-tokens?creator=" + creator.toString(), { headers: { "ngrok-skip-browser-warning": "true" } })
  const data = await res.json() as {usd_volume: number, volume: number, token: string, num_plays: number}[]

  return data.map((x) => ({
    mint: new PublicKey(x.token),
    volume: x.volume,
    usd_volume: x.usd_volume,
    numPlays: x.num_plays,
  }))
}

export const fetchChart = async (pool: PublicKey) => {
  const res = await window.fetch(API_ENDPOINT + "/ratio?pool=" + pool.toBase58(), { headers: { "ngrok-skip-browser-warning": "true" } })
  return await res.json() as RatioData[]
}

export const fetchTopCreators = async () => {
  const res = await window.fetch(API_ENDPOINT + "/top-platforms", { headers: { "ngrok-skip-browser-warning": "true" } })
  return await res.json() as TopCreatorsData[]
}

export const fetchRecentPlays = async (
  connection: Connection,
  pool?: PublicKey,
  skip?: number,
) => {
  const e = !pool ? "/events/settledGames?pool=" : "/events/settledGames?pool=" + pool?.toBase58()
  const res = await window.fetch(API_ENDPOINT + e, { headers: { "ngrok-skip-browser-warning": "true" } })
  const { signatures } = await res.json()
  const events = await fetchGambaTransactionsFromSignatures(connection, signatures) as GambaTransaction<"GameSettled">[]
  return events.sort((a, b) => {
    return b.time - a.time
  })
}

export async function parseSignatureResponse(connection: any, signatures: string[]) {
  const events = await fetchGambaTransactionsFromSignatures(connection, signatures) as GambaTransaction<"GameSettled">[]
  return events.sort((a, b) => {
    return b.time - a.time
  })
}

export const fetchPoolChanges = async (connection: Connection, pool: PublicKey) => {
  const res = await window.fetch(API_ENDPOINT + "/events/poolChanges?pool=" + pool.toBase58(), { headers: { "ngrok-skip-browser-warning": "true" } })
  const { signatures } = await res.json()
  const events = await fetchGambaTransactionsFromSignatures(connection, signatures) as GambaTransaction<"PoolChange">[]
  return events.sort((a, b) => {
    return b.time - a.time
  })
}

export const apiFetcher = async <T>(endpoint: string) => {
  const res = await window.fetch(endpoint, { headers: { "ngrok-skip-browser-warning": "true" } })
  if (res.ok) {
    return await res.json() as T
  }
  try {
    throw (await res.json()).error
  } catch {
    throw res.statusText
  }
}

// export function useApi<T extends Endpoints>(endpoint: T, query?: Record<string, any>) {
//   return useSWR<ApiEndpoints[T]>(getApiUrl(endpoint, query), apiFetcher)
// }

export const getApiUrl = (endpoint: string, _query?: Record<string, any>) => {
  // const start = String(_query?.start ?? 0)
  // const end = String(_query?.end ?? NOW / 1000)
  const query = {..._query}
  const trimmed = Object.entries(query).reduce((prev, [key, value]) => {
    if (typeof value === 'undefined') return prev
    return {...prev, [key]: String(value)}
  }, {} as Record<string, string>)
  const params = new URLSearchParams(trimmed)
  return API_ENDPOINT + endpoint + '?' + params
}
