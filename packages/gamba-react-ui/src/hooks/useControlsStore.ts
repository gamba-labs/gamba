import { create } from 'zustand'
import { GameControlDefinition } from '../types'

export interface ControlsStore {
  gameControls: GameControlDefinition

  setGameControls: (gameControls: GameControlDefinition) => void

  values: Record<string, number>
}

export const useControlsStore = create<ControlsStore>(
  (set) => ({
    gameControls: {},
    setGameControls: (gameControls) => set({ gameControls }),
    values: {},
  }),
)
