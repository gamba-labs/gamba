import { Account } from './Account'
import { BetSettledEvent, HouseState, ParsedHouse, ParsedUser, UserState, UserStatus } from './types'
import { bnToNumber, zeroUnless } from './utils'

const parseStatus = (x: UserState['status']) => Object.keys(x)[0] as UserStatus

export const parseUserAccount = (account: Account<UserState>): ParsedUser => {
  const { state, info } = account

  if (!state || !info) {
    return {
      publicKey: account.publicKey,
      created: false,
      status: 'none',
      balance: 0,
      bonusBalance: 0,
      nonce: 0,
      _accountBalance: zeroUnless(info?.lamports),
      state,
    }
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
    _accountBalance: info.lamports,
    state,
  }
}

export const parseHouseAccount = (account: Account<HouseState>): ParsedHouse => {
  const { state, info } = account
  if (!state || !info) {
    return {
      publicKey: account.publicKey,
      state,
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
    }
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

export type ParsedSettledBetEvent = ReturnType<typeof parseSettledBetEvent>

export const parseSettledBetEvent = (data: BetSettledEvent, signature: string) => {
  return {
    creator: data.creator,
    clientSeed: data.clientSeed,
    wager: bnToNumber(data.wager),
    signature: signature,
    estimatedTime: Date.now(),
    resultIndex: bnToNumber(data.resultIndex),
    resultMultiplier: bnToNumber(data.resultMultiplier) / 1000,
    rngSeed: data.rngSeed,
    player: data.player,
    nonce: bnToNumber(data.nonce),
  }
}
