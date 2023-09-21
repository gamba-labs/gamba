import { DailyVolume } from './data'

const URL = 'https://209.38.229.113.nip.io:3001'

const days = (Date.now() - 1000 * 60 * 60 * 24 * 30) / 1000

export const getDailyVolume = async () => {
  const res = await window.fetch(URL + '/daily-volume?start=' + days + '&end=' + Date.now() + '&creator=', { method: 'GET' })
  return (await res.json()).daily_volumes as DailyVolume[]
}

export const getCreators = async () => {
  const res = await window.fetch(URL + '/top-creators/total-wager?start=' + days + '&end=' + Date.now() + '&creator=', { method: 'GET' })
  return (await res.json()).creators as {creator: string, total_wager: number}[]
}

export const getPlayers = async () => {
  const res = await window.fetch(URL + '/unique-players?start=' + days + '&end=' + Date.now() + '&creator=', { method: 'GET' })
  const uniquePlayers = (await res.json()).unique_players as number
  return uniquePlayers
}
