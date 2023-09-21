import { PublicKey } from '@solana/web3.js'

export interface DailyVolume {
  date: string
  total_volume: number
}

interface CreatorMeta {
  address: string
  name: string
  url: string
}

export const CREATORS = [
  {
    address: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
    name: 'Gamba Demo',
    url: 'https://play.gamba.so',
  },
  {
    address: 'EjJxmSmbBdYu8Qu2PcpK8UUnBAmFtGEJpWFPrQqHgUNC',
    name: 'Guacamole',
    url: 'https://guacamole.gg/play',
  },
  {
    address: '399KgE5gpzFvBB8arZLxA2bes3n4FY7rTMmzifHohPzx',
    name: 'Ninja Turtles',
    url: 'https://playninjatss.com/',
  },
]

const CREATORS_BY_ADDRESS = CREATORS.reduce((prev, meta) => ({
  ...prev,
  [meta.address]: meta,
}), {} as Record<string, CreatorMeta>)

export const getCreatorMeta = (address: string | PublicKey) => {
  return CREATORS_BY_ADDRESS[address.toString()] ?? { address, name: address.toString().substring(0, 6) + '..' }
}
