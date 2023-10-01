import { DailyVolume } from './data'

const URL = 'https://209.38.229.113.nip.io:3001'

const ONE_DAY = 1000 * 60 * 60 * 24
export const START_TIME = (Date.now() - ONE_DAY * 30)
export const END_TIME = (Date.now())

export const getDailyVolume = async (creator?: string) => {
  const res = await window.fetch(URL + `/daily-volume?start=` + START_TIME / 1000 + '&end=' + END_TIME / 1000 + `&creator=${creator ?? ''}`)
  return (await res.json()).daily_volumes as DailyVolume[]
}

export const getCreators = async () => {
  const res = await window.fetch(URL + '/stats/creators?start=' + 0 + '&end=' + END_TIME / 1000 + '&creator=' + '')
  const creators = (await res.json()).creators as {creator: string, volume: number}[]
  return creators.sort((a, b) => b.volume - a.volume)
}

export const getPlayers = async (params: {creator?: string, startTime: number, endTime: number}) => {
  const res = await window.fetch(URL + '/unique-players?start=' + params.startTime / 1000 + '&end=' + params.endTime / 1000 + `&creator=${params.creator ?? ''}`)
  const uniquePlayers = (await res.json()).unique_players as number
  return uniquePlayers
}

export interface RecentBet {
  signature: string
  blockTime: number
  player: string
  creator: string
  multiplier: number
  wager: number
}

export const getBets = async ({page, creator, player}: {page: number, creator?: string, player?: string}) => {
  const res = await window.fetch(URL + (`/bets?creator=${creator ?? ''}&limit=20&skip=${page * 20}&player=${player ?? ''}`))
  return (await res.json()).bets as RecentBet[]
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

export const getTopBets = async (params?: {creator?: string}) => {
  const res = await window.fetch(URL + '/stats/top-bets?start=' + (Date.now() - ONE_DAY * 7) / 1000 + '&end=' + END_TIME / 1000 + `&creator=${params?.creator ?? ''}`)
  return (await res.json()) as TopBetResult
}

export interface TopPlayer {
  player: string
  net_wins: number
}

export interface TopPlayerWager {
  player: string
  total_wager: number
}

export const getTopPlayers = async (params: {creator: string}) => {
  const res = await window.fetch(URL + '/top-players/winners?start=' + (Date.now() - ONE_DAY * 7) / 1000 + '&end=' + END_TIME / 1000 + `&creator=${params.creator ?? ''}`)
  return (await res.json()).players as TopPlayer[]
}

export const getTopPlayersByWager = async (params: {creator: string}) => {
  const res = await window.fetch(URL + '/top-players/total-wager?start=' + (Date.now() - ONE_DAY * 7) / 1000 + '&end=' + END_TIME / 1000 + `&creator=${params.creator ?? ''}`)
  return (await res.json()).players as TopPlayerWager[]
}
