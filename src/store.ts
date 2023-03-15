import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { create } from 'zustand'
import { GambaEventEmitter } from './events'
import { GambaStore } from './types'
import { randomSeed } from './utils'
const IDL = require('./idl')

export const useGambaStore = create<GambaStore>((set, get) => ({
  playRequested: undefined,
  eventEmitter: new GambaEventEmitter,
  set,
  seed: randomSeed(),
  program: new PublicKey(IDL.metadata.address),
  config: {
    name: 'Gamba Game',
    creator: null!,
  },
  house: {
    address: null!,
    balance: 0,
  },
  player: {
    address: null,
    balance: 0,
  },
  game: {
    created: false,
    balance: 0,
    _accountBalance: 0,
    address: null!,
    state: null,
  },
  recentBets: [],
}))
