import { AccountInfo } from '@solana/web3.js'
import { createHouseState, createUserState, createWalletState } from './state'
import { BetSettledEvent, GameEvent, GameResult, ParsedHouse, ParsedUser, ParsedWallet, UserState, UserStatus } from './types'
import { bnToNumber, decodeHouse, decodeUser, getGameHash } from './utils'

const parseStatus = (x: UserState['status']) => Object.keys(x)[0] as UserStatus

const getGameResultFromUser = async (
  state: UserState,
): Promise<GameResult | null> => {
  if (!state.previousRngSeed) {
    return null
  }
  const clientSeed = state.currentGame.clientSeed
  const bet = state.currentGame.options.map((x) => x / 1000)
  const nonce = bnToNumber(state.nonce) - 1
  const rngSeed = state.previousRngSeed
  const gameHash = await getGameHash(rngSeed, clientSeed, nonce)
  const resultIndex = parseInt(gameHash.substring(0, 5), 16) % bet.length
  const multiplier = bet[resultIndex]
  const wager = bnToNumber(state.currentGame.wager)
  const payout = (wager * multiplier)
  const profit = (payout - wager)

  return {
    creator: state.currentGame.creator,
    player: state.owner,
    rngSeed,
    clientSeed,
    nonce,
    bet,
    resultIndex,
    wager,
    payout,
    profit,
    multiplier,
  }
}

export const parseUserAccount = async (info: AccountInfo<Buffer> | null): Promise<ParsedUser> => {
  const state = decodeUser(info)
  if (!state) {
    return createUserState()
  }
  // Exclude active wagered balance from user balance
  const subtractedUserBalance = (() => {
    if (state.status.hashedSeedRequested) {
      return bnToNumber(state.currentGame.wager)
    }
    return 0
  })()
  return {
    created: state.created,
    status: parseStatus(state.status),
    balance: bnToNumber(state.balance) - subtractedUserBalance,
    bonusBalance: bnToNumber(state.bonusBalance),
    nonce: bnToNumber(state.nonce),
    lastGame: await getGameResultFromUser(state),
  }
}

export const parseHouseAccount = (info: AccountInfo<Buffer> | null): ParsedHouse => {
  const state = decodeHouse(info)
  if (!state) {
    return createHouseState()
  }
  const houseFee = bnToNumber(state.houseFee) / 1000
  const creatorFee = bnToNumber(state.creatorFee) / 1000
  return {
    created: state?.created,
    rng: state.rng,
    balance: 0,
    bonusMint: state.bonusMint,
    maxPayout: bnToNumber(state.maxPayout),
    fees: {
      total: houseFee + creatorFee,
      house: houseFee,
      creator: creatorFee,
    },
  }
}

export const parseWalletAccount = (info: AccountInfo<Buffer> | null): ParsedWallet => {
  if (!info) {
    return createWalletState()
  }
  return { balance: info.lamports }
}

export const parsePlayEvent = (data: GameEvent): GameResult => {
  const multiplier = bnToNumber(data.resultMultiplier) / 1000
  const wager = bnToNumber(data.wager)
  const payout = (wager * multiplier)
  const profit = (payout - wager)
  return {
    creator: data.creator,
    clientSeed: data.clientSeed,
    wager,
    resultIndex: bnToNumber(data.resultIndex),
    multiplier,
    rngSeed: data.rngSeed,
    player: data.player,
    nonce: bnToNumber(data.nonce),
    bet: data.options.map((x) => x / 1000),
    payout,
    profit,
  }
}

export const parseBetSettledEvent = (data: BetSettledEvent): GameResult => {
  const multiplier = bnToNumber(data.resultMultiplier) / 1000
  const wager = bnToNumber(data.wager)
  const payout = (wager * multiplier)
  const profit = (payout - wager)
  return {
    creator: data.creator,
    clientSeed: data.clientSeed,
    wager,
    resultIndex: bnToNumber(data.resultIndex),
    multiplier,
    rngSeed: data.rngSeed,
    player: data.player,
    nonce: bnToNumber(data.nonce),
    bet: [],
    payout,
    profit,
  }
}
