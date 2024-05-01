import { GambaEventType, GambaTransaction, fetchGambaTransactionsFromSignatures } from "gamba-core-v2"
import useSWR from "swr"

const API_ENDPOINT = import.meta.env.VITE_GAMBA_API_ENDPOINT

export interface StatsResponse {
  players: number
  usd_volume: number
  plays: number
  creators: number
  revenue_usd: number
  active_players: number
}

export interface StatusResponse {
  syncing: boolean
}

export interface PlayerResponse {
  games_played: number
  games_won: number
  usd_profit: number
  usd_volume: number
}

export interface RecentPlaysResponse {
  total: number
  results: {
    signature: string
    user: string
    token: string
    creator: string
    time: number
    wager: number
    payout: number
    jackpot: number
    multiplier: number
  }[]
}

export interface PoolChangesResponse {
  results: {
    signature: string
    user: string
    token: string
    pool: string
    creator: string
    time: number
    amount: number
    post_liqudity: number
    action: 'deposit' | 'withdraw'
  }[]
}

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
  usd_revenue: number
}

export interface TopPlayersResponse {
  players: {
    user: string
    usd_profit: number
    usd_profit_net: number
    usd_fees: number
    usd_volume: number

    token_volume?: number
    token_profit?: number
  }[]
}

export type PlatformTokenResponse = {
  usd_volume: number
  volume: number
  token: string
  num_plays: number
}[]

export async function parseSignatureResponse<Event extends GambaEventType>(connection: any, signatures: string[]) {
  const events = await fetchGambaTransactionsFromSignatures(connection, signatures) as GambaTransaction<Event>[]
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

export function useApi<T extends any>(endpoint: string, query?: Record<string, any>) {
  return useSWR<T>(getApiUrl(endpoint, query), apiFetcher)
}

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
