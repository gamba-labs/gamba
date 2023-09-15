import { PublicKey } from '@solana/web3.js'
export { IDL, type Gamba as GambaIdl } from './idl'

export const SYSTEM_PROGRAM = new PublicKey('11111111111111111111111111111111')
export const PROGRAM_ID = new PublicKey('GambaXcmhJg1vgPm1Gn6mnMKGyyR3X2eSmF6yeU6XWtT')
export const BET_UNIT = 1_000
export const MIN_BET = 50_000_000 // 0.05 SOL

export const LAMPORTS_PER_SOL = 1e9
