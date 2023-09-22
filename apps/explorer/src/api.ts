import { DailyVolume } from './data'

const URL = 'https://209.38.229.113.nip.io:3001'

const daysAgo = 30
const startTime = (Date.now() - 1000 * 60 * 60 * 24 * daysAgo) / 1000

export const getDailyVolume = async () => {
  const res = await window.fetch(URL + '/daily-volume?start=' + startTime + '&end=' + Date.now() + '&creator=' + '', { method: 'GET' })
  return (await res.json()).daily_volumes as DailyVolume[]
}

export const getCreators = async () => {
  const res = await window.fetch(URL + '/stats/creators?start=' + startTime + '&end=' + Date.now() + '&creator=' + '', { method: 'GET' })
  const creators = (await res.json()).creators as {creator: string, volume: number}[]
  return creators.sort((a, b) => b.volume - a.volume)
}

export const getPlayers = async () => {
  const res = await window.fetch(URL + '/unique-players?start=' + startTime + '&end=' + Date.now() + '&creator=' + '', { method: 'GET' })
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

export const getBets = async (page = 0) => {
  const res = await window.fetch(URL + '/bets?creator=' + '' + '&limit=25&skip=' + page * 25, { method: 'GET' })
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

export const getTopBets = async () => {
  const res = await window.fetch(URL + '/stats/top-bets?start=' + startTime + '&end=' + Date.now() + '&creator=' + '', { method: 'GET' })
  return (await res.json()) as TopBetResult
}
