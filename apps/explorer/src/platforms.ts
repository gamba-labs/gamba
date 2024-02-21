import { PublicKey } from '@solana/web3.js'

interface PlatformMeta {
  address: string
  name: string
  url?: string
  image?: string
}

export const PLATFORMS = [
  {
    address: 'V2grJiwjs25iJYqumbHyKo5MTK7SFqZSdmoRaj8QWb9',
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
    address: 'A1yPM7RjvUetd6Fq8VRTatPSsidqWWwydascNShkVc91',
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
    name: 'Fronk Casino',
    url: 'https://casino.fronk.xyz/',
    image: '/logos/fronk.png',
  },
  {
    address: '7hSpQrpDXCddqLWPg6aWcFCnnYwCsUnuFYiBTe3rRxjL',
    name: 'Queckz Babiez',
    url: 'https://www.quekzbabiez.games/',
    image: '/logos/quekzbabiez.png',
  },
  {
    address: '6eBxsBoLNuJYJzA5HGadfw4FRZRJNf3aAJQBsAKhPoGu',
    name: 'Broosters',
    url: 'https://www.broosters.xyz/',
    image: '/logos/broosters.png',
  },
  {
    address: '6SaxsBTCRRK1xFT2c7iPSirx2aSZLsuY28S28shmLm11',
    name: 'BeeBets',
    url: 'https://beebets.net',
    image: '/logos/beebets.png',
  },
  {
    address: '3WdcfH6Gwe5bT6sXueUu7gb7U7dMq1yUFm351RJ4zLQT',
    name: 'Topia Casino',
    url: 'https://topia.casino/',
    image: '/logos/topiacasino.png',
  },
  {
    address: '7hwBxJUYaF4PJGTKqkqaqJ7KXgTVtx9oWR3YggUfzuVa',
    name: 'SolVegas',
    url: 'https://solvegas.net/',
    image: '/logos/solvegas.png',
  },
  {
    address: '594WGMyY5TSqPQnGjHHMqoSYYSrtbSFYL3NuXUp8qzkQ',
    name: 'MagicInternetBets',
    image: '/logos/magicinternetbets.png',
  },
  {
    address: 'FJDu3MBh77TUnqZgTVvXHjnA5gsHtjPbseTg6DRrLmXx',
    name: 'SolanaStars',
    url: 'https://solanastars.com/',
    image: '/logos/solanastars.png',
  },
  {
    address: "7s3nxNnKcmJyBxxXeJb8AAJnRocJLCRhbrCcYhPKv5SP",
    name: "OHYEAH",
    image: "https://ohyeah.bet/favicon.png"
  },
]

const PLATFORMS_BY_ADDRESS = PLATFORMS.reduce((prev, meta) => ({
  ...prev,
  [meta.address]: meta,
}), {} as Record<string, PlatformMeta>)

export const getPlatformMeta = (address: string | PublicKey) => {
  return PLATFORMS_BY_ADDRESS[address.toString()] ?? { address: address.toString(), name: address.toString().substring(0, 9) }
}
