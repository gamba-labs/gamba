import { PublicKey } from '@solana/web3.js'
import { Account } from './Account'
import { GameEvent, HouseState, ParsedHouse, GameResult, ParsedUser, UserState, UserStatus } from './types'
import { bnToNumber } from './utils'

const parseStatus = (x: UserState['status']) => Object.keys(x)[0] as UserStatus

export const defaultUser = (publicKey: PublicKey): ParsedUser => ({
  publicKey,
  created: false,
  status: 'none',
  balance: 0,
  bonusBalance: 0,
  nonce: 0,
  state: null,
})

export const defaultHouse = (publicKey: PublicKey): ParsedHouse => ({
  publicKey,
  state: null,
  created: false,
  rng: null,
  bonusMint: null,
  balance: 0,
  maxPayout: 0,
  fees: {
    total: 0,
    house: 0,
    creator: 0,
  },
})

export const parseUserAccount = (account: Account<UserState>): ParsedUser => {
  const { state, info } = account

  if (!state || !info) {
    return defaultUser(account.publicKey)
  }

  // Exclude active wagered balance from user balance
  const subtractedUserBalance = (() => {
    if (state.status.hashedSeedRequested) {
      return bnToNumber(state.currentGame.wager)
    }
    return 0
  })()

  return {
    publicKey: account.publicKey,
    created: state.created,
    status: parseStatus(state.status),
    balance: bnToNumber(state.balance) - subtractedUserBalance,
    bonusBalance: bnToNumber(state.bonusBalance),
    nonce: bnToNumber(state.nonce),
    state,
  }
}

export const parseHouseAccount = (account: Account<HouseState>): ParsedHouse => {
  const { state, info } = account
  if (!state || !info) {
    return defaultHouse(account.publicKey)
  }
  const houseFee = bnToNumber(state.houseFee) / 1000
  const creatorFee = bnToNumber(state.creatorFee) / 1000
  return {
    publicKey: account.publicKey,
    state,
    created: state?.created,
    rng: state.rng,
    balance: info.lamports,
    bonusMint: state.bonusMint,
    maxPayout: bnToNumber(state.maxPayout),
    fees: {
      total: houseFee + creatorFee,
      house: houseFee,
      creator: creatorFee,
    },
  }
}

export interface ParsedWallet {
  publicKey: PublicKey
  balance: number
}

export const parseWalletAccount = (account: Account<null>) => {
  const { info } = account
  if (!info) {
    return {
      publicKey: account.publicKey,
      balance: 0,
    }
  }
  return {
    publicKey: account.publicKey,
    balance: info.lamports,
  }
}

export const parsePlayEvent = (
  data: GameEvent,
  signature: string,
  estimatedTime: number,
): GameResult => {
  const multiplier = bnToNumber(data.resultMultiplier) / 1000
  const wager = bnToNumber(data.wager)
  const payout = (wager * multiplier)
  const profit = (payout - wager)
  return {
    signature,
    estimatedTime,
    creator: data.creator,
    clientSeed: data.clientSeed,
    wager,
    resultIndex: bnToNumber(data.resultIndex),
    multiplier,
    rngSeed: data.rngSeed,
    player: data.player,
    nonce: bnToNumber(data.nonce),
    bet: data.options,
    payout,
    profit,
  }
}
