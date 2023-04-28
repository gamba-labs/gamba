import { RecentPlayEvent } from 'gamba-core'
import { create } from 'zustand'

interface GambaUiState {
  modal: boolean
  recentPlays: RecentPlayEvent[],
  addRecentPlays: (recentPlays: RecentPlayEvent[]) => void,
  setModal: (modal: boolean) => void
}

export const useGambaUi = create<GambaUiState>((set, get) => ({
  recentPlays: [],
  addRecentPlays: (added) =>
    set({
      recentPlays: [...get().recentPlays, ...added]
        .sort((a, b) => b.estimatedTime - a.estimatedTime),
    }),
  modal: false,
  setModal: (modal) => set({ modal }),
}))
