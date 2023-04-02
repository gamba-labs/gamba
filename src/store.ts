import { create } from 'zustand'
import { GambaEventEmitter } from './events'
import { GambaStore } from './types'
import { randomSeed } from './utils'

export const useGambaStore = create<GambaStore>((set) => ({
  eventEmitter: new GambaEventEmitter,
  set,
  seed: randomSeed(),
  accounts: {
    house: null,
    user: null,
    wallet: null,
  },
  config: {
    name: 'Gamba Game',
    creator: null!,
  },
  wallet: { balance: 0 },
  user: {
    created: false,
    balance: 0,
    _accountBalance: 0,
    state: null,
    status: 'none',
  },
  house: {
    balance: 0,
    state: null,
    maxPayout: 0,
    fees: {
      creator: 0,
      house: 0,
    },
  },
  recentGames: [],
}))
