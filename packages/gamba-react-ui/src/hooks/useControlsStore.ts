import { create } from 'zustand'
import { GameControlsSceme } from '../types'

export interface ControlsStore {
  scheme: GameControlsSceme
  setScheme: (scheme: GameControlsSceme) => void

  values: Record<string, number>

  wager: number
  setWager: (value: number) => void
}

export const useControlsStore = create<ControlsStore>(
  (set) => ({
    scheme: {},
    setScheme: (scheme) => set({ scheme }),
    setWager: (wager) => set({ wager }),
    values: {},
    wager: 0,
  }),
)
