import { DailyVolume } from './data'

const URL = 'https://209.38.229.113.nip.io:3001'

export const getDailyVolume = async () => {
  const res = await window.fetch(URL + '/daily-volume?start=0&end=' + Date.now() + '&creator=', { method: 'GET' })
  return (await res.json()).daily_volumes as DailyVolume[]
}

export const getCreators = async () => {
  const res = await window.fetch(URL + '/top-creators/total-wager?start=0&end=' + Date.now() + '&creator=', { method: 'GET' })
  return (await res.json()).creators as {creator: string, total_wager: number}[]
}

export const getPlayers = async () => {
  const res = await window.fetch(URL + '/unique-players?start=0&end=' + Date.now() + '&creator=', { method: 'GET' })
  const uniquePlayers = (await res.json()).unique_players as number
  return uniquePlayers
}
