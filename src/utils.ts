import { Enum } from '@solana/web3.js'
import { Buffer } from 'buffer'

export const randomSeed = (len = 16) =>
  Array.from({ length: len }).map(() =>
    (Math.random() * 16 | 0).toString(16),
  ).join('')

export async function sha256(message: string) {
  const arrayBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
  return Buffer.from(arrayBuffer).toString('hex')
}

export const getEnum = (x: any | undefined) => new Enum(x).enum
