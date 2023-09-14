import { ParsedHouse, ParsedUser, ParsedWallet } from './types'

export interface State {
  user: ParsedUser
  house: ParsedHouse
  wallet: ParsedWallet
}

export const createUserState = (): ParsedUser => ({
  created: false,
  status: 'none',
  balance: 0,
  bonusBalance: 0,
  nonce: 0,
  lastGame: null,
})

export const createHouseState = (): ParsedHouse => ({
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

export const createWalletState = (): ParsedWallet => ({ balance: 0 })

export const createState = (): State => {
  return {
    user: createUserState(),
    house: createHouseState(),
    wallet: createWalletState(),
  }
}
