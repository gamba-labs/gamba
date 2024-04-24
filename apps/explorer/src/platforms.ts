import { PublicKey } from '@solana/web3.js'

export interface PlatformMeta {
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
    address: '399KgE5gpzFvBB8arZLxA2bes3n4FY7rTMmzifHohPzx',
    name: 'Ninja Turtles',
    url: 'https://ninjatsscasino.xyz/',
    image: '/logos/ninjaturtles.png',
  },
  {
    address: 'A1yPM7RjvUetd6Fq8VRTatPSsidqWWwydascNShkVc91',
    name: 'Smashy.gg',
    url: 'https://smashy.gg',
    image: '/logos/smashy.png',
  },
  {
    address: 'BgZYULwffQFARvqreWALeubMQtpGPFxeRaXDBPnmVrqE',
    name: 'PNDC',
    url: 'https://pndc-solana.vercel.app/',
    image: '/logos/pndc.png',
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
    image: "/logos/ohyeah.png"
  },
  {
    address: "6715ymvd38EeSQjZ3vRSA9X68RC73GYynSNRn3pu5732",
    name: "Felt Casino",
    url: "https://casino.feltgaming.io/",
    image: "/logos/felt.png"
  },
  {
    address: "EV37Xym1wwjc5bToPyQPXAVEZfNwVvuDXzdCrTuLfGqQ",
    name: "SnoopyBabe",
    url: "https://play.snoopybabe.com",
    image: "/logos/snoopybabe.png"
  },
  {
    address: "4H78a8exeM6HDetdgpCFeQTo2jZcypwiGoebW9qrUG1s",
    name: "Solcade",
    url: "https://play.solcade.net/",
    image: "/logos/solcade.png"
  },
  {
    address: 'E8tzfzDJa2CVc2BVXu6mmg83sp2JV4mXeVTvR5GwCJyu',
    name: 'SolBets',
    url: 'https://solbets.app',
    image: '/logos/solbets.png',
  },
  {
    address: 'GigeGLQVXCHWrdoV4DoC6ymfTtPCGWcGwnoQyxVuxgEa',
    name: 'DOGGO GAMES',
    image: '/logos/doggogames.png',
  },
  {
    address: 'HvX1mNoVH7EaqB6KDdgzsHageuNBvbgrpPvnNcEpcTva',
    name: 'YKD games',
    image: '/logos/ykdgames.png',
  },
]

const PLATFORMS_BY_ADDRESS = PLATFORMS.reduce((prev, meta) => ({
  ...prev,
  [meta.address]: meta,
}), {} as Record<string, PlatformMeta>)

export const getPlatformMeta = (address: string | PublicKey): PlatformMeta | undefined => {
  return PLATFORMS_BY_ADDRESS[address.toString()]
}
