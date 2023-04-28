// https://docs.pmnd.rs/zustand/guides/initialize-state-with-props
import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'
import { GambaUiProps } from './Provider'
import { RecentPlayEvent } from 'gamba-core'

interface GambaUiState extends GambaUiProps {
  modal: boolean
  recentPlays: RecentPlayEvent[],
  addRecentPlays: (recentPlays: RecentPlayEvent[]) => void,
  setModal: (modal: boolean) => void
}

export type GambaUiStore = ReturnType<typeof createGambaUiStore>

export const createGambaUiStore = (initProps?: Partial<GambaUiProps>) => {
  const DEFAULT_PROPS: GambaUiProps = { games: [] }
  return createStore<GambaUiState>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    recentPlays: [],
    addRecentPlays: (added) =>
      set({
        recentPlays: [...get().recentPlays, ...added]
          .sort((a, b) => b.estimatedTime - a.estimatedTime),
      }),
    modal: false,
    setModal: (modal) => set({ modal }),
  }))
}

export const GambaUiContext = createContext<GambaUiStore>(null!)

export function useGambaUi<T>(
  selector: (state: GambaUiState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  const store = useContext(GambaUiContext)
  if (!store) throw new Error('Missing GambaUiContext.Provider in the tree')
  return useStore(store, selector, equalityFn)
}
