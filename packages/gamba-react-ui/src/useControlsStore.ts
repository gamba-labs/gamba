import { StoreApi, create } from 'zustand'

export interface ControlsStore {
  disabled?: boolean
  controlsNode: React.ReactNode | null
  set: StoreApi<ControlsStore>['setState']
}

export const useControlsStore = create<ControlsStore>(
  (set) => ({
    controlsNode: null,
    set,
  }),
)
