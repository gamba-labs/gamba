import { PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'

export const isPubkey = (s: string) => {
  try {
    new PublicKey(s)
    return true
  } catch {
    return false
  }
}

export const isSignature = (s: string) => {
  try {
    const decoded = bs58.decode(s)
    return (decoded.length === 64)
  } catch {
    return false
  }
}

export const truncateString = (s: string, startLen=4, endLen=startLen) => s.slice(0, startLen) + '...' + s.slice(-endLen)
