import { DailyVolume } from './data'

const URL = 'https://209.38.229.113.nip.io:3001'

const ONE_DAY = 1000 * 60 * 60 * 24
const startTime = (Date.now() - ONE_DAY * 30) / 1000
const endTime = (Date.now() - ONE_DAY * 0) / 1000

export const getDailyVolume = async () => {
  const res = await window.fetch(URL + '/daily-volume?start=' + startTime + '&end=' + endTime + '&creator=' + '', { method: 'GET' })
  return (await res.json()).daily_volumes as DailyVolume[]
}

export const getCreators = async () => {
  const res = await window.fetch(URL + '/stats/creators?start=' + startTime + '&end=' + endTime + '&creator=' + '', { method: 'GET' })
  const creators = (await res.json()).creators as {creator: string, volume: number}[]
  return creators.sort((a, b) => b.volume - a.volume)
}

export const getPlayers = async () => {
  const res = await window.fetch(URL + '/unique-players?start=' + startTime + '&end=' + endTime + '&creator=' + '', { method: 'GET' })
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
  const res = await window.fetch(URL + '/bets?player=&limit=25&skip=' + page * 25, { method: 'GET' })
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
  const res = await window.fetch(URL + '/stats/top-bets?start=' + startTime + '&end=' + endTime + '&creator=' + '', { method: 'GET' })
  return (await res.json()) as TopBetResult
}
