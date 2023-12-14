/**
 * Store client settings here
 */

import { StoreApi, create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface UserStore {
  newcomer: boolean
  set: StoreApi<UserStore>['setState']
}

export const useUserStore = create(
  persist<UserStore>(
    (set) => ({
      newcomer: true,
      set,
    }),
    {
      name: 'user',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
