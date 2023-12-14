import { create } from "zustand"

interface Toast {
  title: string
  description: string
  link?: string
}

interface ToastStore {
  toasts: Toast[]

  add: (toast: Toast) => void
}

export const useToastStore = create<ToastStore>(
  (set, get) => ({
    toasts: [],

    add: toast => {
      set({ toasts: [...get().toasts, toast] })
    },
  }),
)

export function useToast() {
  return useToastStore(state => state.add)
}
