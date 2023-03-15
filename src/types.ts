import { PublicKey } from '@solana/web3.js'
import { StoreApi } from 'zustand'
import { GambaConfig } from './config'
import { GambaEventEmitter } from './events'

export interface GameResult {
  player: PublicKey
  amount: number
  payout: number
  multiplier: number
  resultIndex: number
  blockTime: number
  nonce: number
}

export interface Game {
  /**
   * If the account has been created and exists
   */
  created: boolean
  /**
   * Address of the PDA
   */
  address: PublicKey
  /**
   * The on-chain state of the account
   */
  state: GameState | null
  /**
   * Account balance available to the player
   */
  balance: number
  /**
   * Total account balance in lamports
   */
  _accountBalance: number
}

export interface Player {
  address: PublicKey | null
  /**
   * Lamports in the players wallet
   */
  balance: number
}

export interface House {
  address: PublicKey
  balance: number
}

export type GameState = any

export interface GambaStore {
  playRequested: string | undefined,
  eventEmitter: GambaEventEmitter,
  set: StoreApi<GambaStore>['setState']
  program: PublicKey
  config: GambaConfig
  seed: string
  game: Game
  player: Player
  house: House
  recentBets: GameResult[]
}
