import { create } from 'zustand'
import { GambaEventEmitter } from './events'
import { GambaStore } from './types'
import { randomSeed } from './utils'
import { SettledGameEvent } from '../dist'

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
  addRecentGames: (bets: SettledGameEvent[]) =>
    set((s) => ({
      recentGames:
        [...s.recentGames, ...bets]
          .filter(
            (a, i, arr) => {
              const key = (game: SettledGameEvent) => game.player.toBase58() + '-' + game.nonce
              return arr.findIndex((b) => key(b) === key(a)) === i
            },
          )
          .sort((a, b) => b.estimatedTime - a.estimatedTime)
          .slice(0, 100),
    })),
}))
