import { PublicKey } from '@solana/web3.js'

export interface DailyVolume {
  date: string
  total_volume: number
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
].reduce((prev, { address, name }) => ({
  ...prev,
  [address]: { address, name },
}), {} as Record<string, {address: string, name: string}>)

export const getCreatorMeta = (address: string | PublicKey) => {
  return CREATORS[address.toString()] ?? { address, name: address.toString().substring(0, 6) + '...' }
}
