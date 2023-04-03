import { PublicKey } from '@solana/web3.js'
import { Buffer } from 'buffer'
export { IDL } from './idl'

export const SYSTEM_PROGRAM = new PublicKey('11111111111111111111111111111111')
export const PROGRAM_ID = new PublicKey('GambaXcmhJg1vgPm1Gn6mnMKGyyR3X2eSmF6yeU6XWtT')
export const BET_UNIT = 1000

export const HOUSE_SEED = Buffer.from('house')
export const USER_SEED = Buffer.from('user')
