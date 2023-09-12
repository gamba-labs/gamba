import { IdlAccounts, IdlEvents, Wallet as AnchorWallet, Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { GambaIdl } from './constants'
import { Gamba } from './idl'

export type Wallet = Omit<AnchorWallet, 'payer'> & {payer?: Keypair}

export type HouseState = IdlAccounts<GambaIdl>['house']
export type UserState = IdlAccounts<GambaIdl>['user']
export type UserStatus = keyof UserState['status']
export type GameEvent = IdlEvents<GambaIdl>['GameEvent']

export type GambaProgram = Program<Gamba>

export interface ParsedUser {
  publicKey: PublicKey
  created: boolean
  status: UserStatus
  balance: number
  bonusBalance: number
  nonce: number
  state: UserState | null
}


export interface ParsedHouse {
  publicKey: PublicKey
  state: HouseState | null
  created: boolean
  rng: PublicKey | null
  bonusMint: PublicKey | null
  balance: number
  maxPayout: number
  fees: {
    total: number
    house: number
    creator: number
  }
}

export interface GameResult {
  creator: PublicKey
  player: PublicKey,
  wager: number
  bet: number[]
  clientSeed: string
  resultIndex: number
  multiplier: number
  rngSeed: string
  nonce: number
  payout: number
  profit: number
  signature: string
  estimatedTime: number
}
