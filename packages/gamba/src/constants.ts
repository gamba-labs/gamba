import { PublicKey } from '@solana/web3.js'
import { Buffer } from 'buffer'
export { IDL } from './idl'

export const SYSTEM_PROGRAM = new PublicKey('11111111111111111111111111111111')
export const PROGRAM_ID = new PublicKey('GambaXcmhJg1vgPm1Gn6mnMKGyyR3X2eSmF6yeU6XWtT')
export const BET_UNIT = 1_000
export const MIN_BET = 1_000_000 // 0.001 SOL

export const HOUSE_SEED = Buffer.from('house')
export const USER_SEED = Buffer.from('user')

export enum GambaError {
  GENERIC = 'Generic error',
  USER_ACCOUNT_WAS_CLOSED_BEFORE_RESULT = 'User account was closed before a result was generated',
  FAILED_TO_GENERATE_RESULT = 'Failed to generate a result',
  FAILED_CREATING_USER_ACCOUNT = 'Failed to create User account',
  FAILED_TO_CLOSE_USER_ACCOUNT = 'Failed to close User account',
}
