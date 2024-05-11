import { PublicKey } from '@solana/web3.js'
import platforms from './platforms.json'

export interface PlatformMeta {
  address: string
  name: string
  url?: string
  image?: string
}

export const PLATFORMS = platforms

const PLATFORMS_BY_ADDRESS = PLATFORMS.reduce((prev, meta) => ({
  ...prev,
  [meta.address]: meta,
}), {} as Record<string, PlatformMeta>)

export const getPlatformMeta = (address: string | PublicKey): PlatformMeta | undefined => {
  return PLATFORMS_BY_ADDRESS[address.toString()]
}
