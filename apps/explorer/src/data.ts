import { PublicKey } from '@solana/web3.js'
import { truncateString } from './utils'

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
    address: 'Adn4whbLyQs5b2rnwu9ngiEMxLjndadKbqDqxK4saqKd',
    name: 'Apes On Space',
    url: 'https://gm.apeson.space',
    image: '/logos/apesonspace.png',
  },
  {
    address: 'F1ame86hjDZWG9rqWPBxVo3ELUjMfZYdMikkmfdp7f74',
    name: 'PhoenixBet',
    url: 'https://bet.phnx.one',
    image: '/logos/phoenixbet.png',
  },
  {
    address: '43d7KZaysxPeVg8Pj9VH6FJogmpHa95sM4RXUsMm9TbQ',
    name: 'Pepesolana',
    url: 'https://pepesolana.one',
    image: '/logos/pepesolana.png',
  },
  {
    address: 'BqA8jwLmzapMQPpsjX6e7BJEFGckPTVxhg6gBr16hsZx',
    name: 'Killer Bunnies',
    url: 'https://skbgaming.solkillerbunnies.io',
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
    url: 'https://flip.solarmoon.xyz',
    image: '/logos/solarmoon.png',
  },
  {
    address: '399KgE5gpzFvBB8arZLxA2bes3n4FY7rTMmzifHohPzx',
    name: 'Ninja Turtles',
    url: 'https://ninja-casino-ninjatss.vercel.app',
    image: '/logos/ninjaturtles.png',
  },
  {
    address: '5PAwRPFatXfvhMbLwjCjeKE5Yr6eJrsXnapvEadTdo1z',
    name: 'Breakpoint Casino',
    url: 'https://breakpoint.casino',
    image: '/logos/breakpointcasino.png',
  },
  {
    address: 'FPVE37GsoKpg87NUQpsuBEhauJ8yFpkidLzAjCdvWiZP',
    name: 'Wolf Solana Casino',
    url: 'https://wolf-solana.vercel.app',
    image: '/logos/wolfsolanacasino.png',
  },
]

const CREATORS_BY_ADDRESS = CREATORS.reduce((prev, meta) => ({
  ...prev,
  [meta.address]: meta,
}), {} as Record<string, CreatorMeta>)

export const getCreatorMeta = (address: string | PublicKey) => {
  return CREATORS_BY_ADDRESS[address.toString()] ?? { address: address.toString(), name: truncateString(address.toString()) }
}
