import { PublicKey } from '@solana/web3.js'

export interface DailyVolume {
  date: string
  total_volume: number
}

interface CreatorMeta {
  address: string
  name: string
  url: string
  image?: string
}

export const CREATORS = [
  {
    address: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
    name: 'Gamba Demo',
    url: 'https://play.gamba.so',
    image: '/logos/gamba.png',
  },
  {
    address: 'F1ame86hjDZWG9rqWPBxVo3ELUjMfZYdMikkmfdp7f74',
    name: 'PhoenixBet',
    url: 'https://bet.phnx.one/',
    image: '/logos/phoenixbet.png',
  },
  {
    address: '43d7KZaysxPeVg8Pj9VH6FJogmpHa95sM4RXUsMm9TbQ',
    name: 'Pepesolana',
    url: 'https://pepesolana.one/',
    image: '/logos/pepesolana.png',
  },
  {
    address: 'BqA8jwLmzapMQPpsjX6e7BJEFGckPTVxhg6gBr16hsZx',
    name: 'Killer Bunnies',
    url: 'https://skbgaming.solkillerbunnies.io/',
    image: '/logos/killerbunnies.png',
  },
  {
    address: 'EjJxmSmbBdYu8Qu2PcpK8UUnBAmFtGEJpWFPrQqHgUNC',
    name: 'Guacamole',
    url: 'https://guacamole.gg/play',
    image: '/logos/guacamole.png',
  },
  {
    address: '5AZYZb7sfB5K7P2GCWnB6v2G7urQ3LjoKtKRop8A79DA',
    name: 'SolarMoon',
    url: 'https://flip.solarmoon.xyz/',
    image: '/logos/solarmoon.png',
  },
  {
    address: '399KgE5gpzFvBB8arZLxA2bes3n4FY7rTMmzifHohPzx',
    name: 'Ninja Turtles',
    url: 'https://playninjatss.com',
    image: '/logos/ninjaturtles.png',
  },
  {
    address: '5PAwRPFatXfvhMbLwjCjeKE5Yr6eJrsXnapvEadTdo1z',
    name: 'Breakpoint Casino',
    url: 'https://breakpoint.casino/',
    image: '/logos/breakpointcasino.png',
  },
]

const CREATORS_BY_ADDRESS = CREATORS.reduce((prev, meta) => ({
  ...prev,
  [meta.address]: meta,
}), {} as Record<string, CreatorMeta>)

const truncateString = (s: string) => s.slice(0, 3) + '...' + s.slice(-3)

export const getCreatorMeta = (address: string | PublicKey) => {
  return CREATORS_BY_ADDRESS[address.toString()] ?? { address, name: truncateString(address.toString()) }
}
