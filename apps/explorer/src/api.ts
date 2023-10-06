import useSWR from 'swr'

const URL = 'https://209.38.229.113.nip.io:3001'
const NOW = Date.now()

export interface RecentBet {
  signature: string
  blockTime: number
  player: string
  creator: string
  multiplier: number
  wager: number
}

export interface DailyVolume {
  date: string
  total_volume: number
}

export interface DailyVolumeResponse {
  daily_volumes: DailyVolume[]
}

export interface UniquePlayersResponse {
  unique_players: number
}

export interface TotalVolumeResponse {
  total_volume: number
}

export interface LatestDateResponse {
  latestBlockTime: number
}

export interface CreatorsResponse {
  creators: {creator: string, volume: number}[]
}

export interface BetsResponse {
  bets: RecentBet[]
}

export interface TopPlayersByProfitResponse {
  players: {
    player: string
    net_wins: number
  }[]
}

export interface TopPlayersByTotalWagerResponse {
  players: {
    player: string
    total_wager: number
  }[]
}

export interface TopBetResult {
  top_profit: {
    'signature': string
    'player': string
    'creator': string
    'profit': number
  }[]
  top_multiplier: {
    'signature': string
    'player': string
    'creator': string
    'multiplier': number
  }[]
}

type ApiEndpoints = {
  '/daily-volume': DailyVolumeResponse
  '/total-volume': TotalVolumeResponse
  '/unique-players': UniquePlayersResponse
  '/stats/creators': CreatorsResponse
  '/top-players/winners': TopPlayersByProfitResponse
  '/top-players/total-wager': TopPlayersByTotalWagerResponse
  '/stats/top-bets': TopBetResult
  '/bets': BetsResponse
}

type Endpoints = keyof ApiEndpoints

export const apiFetcher = async <T>(endpoint: string) => {
  const res = await window.fetch(endpoint)
  if (res.ok) {
    return await res.json() as T
  }
  try {
    throw (await res.json()).error
  } catch {
    throw res.statusText
  }
}

export function useApi<T extends Endpoints>(endpoint: T, query?: Record<string, any>) {
  return useSWR<ApiEndpoints[T]>(getApiUrl(endpoint, query), apiFetcher)
}

export const daysAgo = (daysAgo: number) => {
  const now = new Date()
  const then = new Date()
  then.setDate(now.getDate() - daysAgo)
  then.setHours(0, 0, 0, 0)
  return then.getTime()
}

// api doesnt use MS :O
export const seconds = (ms: number) => ms / 1000

export const getApiUrl = (endpoint: string, _query?: Record<string, any>) => {
  const start = String(_query?.start ?? 0)
  const end = String(_query?.end ?? NOW / 1000)
  const query = {..._query, start, end}
  const trimmed = Object.entries(query).reduce((prev, [key, value]) => {
    if (typeof value === 'undefined') return prev
    return {...prev, [key]: String(value)}
  }, {} as Record<string, string>)
  const params = new URLSearchParams(trimmed)
  return URL + endpoint + '?' + params
}
