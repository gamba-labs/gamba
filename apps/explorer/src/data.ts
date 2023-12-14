import { PublicKey } from '@solana/web3.js'
import { truncateString } from './utils'

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
    address: '3wHhNeDcK69AsPQnFJ6buzA15y8MtdTmX2zkDEABr7c7',
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
  {
    address: 'HTpxLUzG2pgyfsbCW9ANwRxqyEPawQNuw2VA5N6UPhip',
    name: 'Sweetscoin',
    url: 'https://playsweets.xyz',
    image: '/logos/sweetscoin.png',
  },
  {
    address: 'BirdXG9bZASu6reNwJoixL2MVFCWxJZJV65uJHCTE5wb',
    name: 'Birdies Solana',
    url: 'https://xbirdies.com',
    image: '/logos/xbirdies.png',
  },
  {
    address: '8Xjf4YMq9qD8cr3rzff8QWV2MD4o4JH4vhiEgLUpBfvF',
    name: 'Smashy.gg',
    url: 'https://smashy.gg',
    image: '/logos/smashy.png',
  },
  {
    address: 'CHADvZfMKNR37yaeCx9xg2HkML5nhBQUUaPiZ2DnASzB',
    name: 'Chads on Solana',
    url: 'https://chadroulette.chadonsolana.xyz/',
    image: '/logos/chads.png',
  },
  {
    address: 'BgZYULwffQFARvqreWALeubMQtpGPFxeRaXDBPnmVrqE',
    name: 'PNDC',
    url: 'https://pndc-solana.vercel.app/',
    image: '/logos/pndc.png',
  },
  {
    address: '2n8R9ukU9U1y8hdtRLRdNQea84LyCzseQP74Y6Ui2wHE',
    name: 'Kongz Casino',
    url: 'https://kongzcasino.vercel.app/',
    image: '/logos/kongz.png',
  },
  {
    address: 'Fdm2bFvGVrtddqwQecYYsff9kR4zES9D2WpvmPUczpaY',
    name: 'Solana Street Bulls',
    url: 'https://casino.solanastreetbulls.com/',
    image: '/logos/solanastreetbulls.png',
  },
  {
    address: '2hHmrohtRqA56iawxioxk37ENsganghf5iqUXBYSp8Br',
    name: 'Mario Pepe Casino',
    url: 'https://mpepe-casino.vercel.app/',
    image: '/logos/mariopepe.png',
  },
  {
    address: 'HBQpKxK2Wdscn4kEBZWyXQ2GuCAEVeH6yinVnc736MVL',
    name: '$SOS Casino',
    url: 'https://soscasino.vercel.app/',
    image: '/logos/soscasino.png',
  },
  {
    address: 'HNcGGH7y3QfQvjx4wrZ2MAGsrzBw6mUDciQGHVwMcLwN',
    name: 'Fronk Arcade',
    url: 'https://arcade.fronk.xyz/',
    image: '/logos/fronk.png',
  },
]

const CREATORS_BY_ADDRESS = CREATORS.reduce((prev, meta) => ({
  ...prev,
  [meta.address]: meta,
}), {} as Record<string, CreatorMeta>)

export const getCreatorMeta = (address: string | PublicKey) => {
  return CREATORS_BY_ADDRESS[address.toString()] ?? { address: address.toString(), name: truncateString(address.toString()) }
}
