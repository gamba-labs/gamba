import { GambaSession, Wallet } from 'gamba-core'
import { useEffect } from 'react'
import { StoreApi, create } from 'zustand'
import { randomSeed } from '../utils'
import { useGambaProvider } from './useGambaProvider'
import { useRerender } from './useRerender'

interface SessionStore {
  seed: string
  session: GambaSession | null
  sessions: Record<string, GambaSession | null>
  set: StoreApi<SessionStore>['setState']
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: {},
  seed: randomSeed(),
  session: null,
  set,
}))

export function useGambaSession(sessionId: string) {
  const provider = useGambaProvider()
  const session = useSessionStore((state) => (state.sessions[sessionId] ?? null) as GambaSession | null)
  const set = useSessionStore((state) => state.set)
  const rerender = useRerender()

  useEffect(() => session?.user?.onChange(rerender),
    [session?.user.publicKey])
  useEffect(() => session?.wallet?.onChange(rerender),
    [session?.wallet.publicKey])

  const create = async (wallet: Wallet) => {
    const session = await provider.createSession(wallet)
    set(({ sessions }) => ({ sessions: { ...sessions, [sessionId]: session } }))
    return session
  }

  const destroy = async () => {
    await session?.destroy()
    set(({ sessions }) => ({ session: null, sessions: { ...sessions, [sessionId]: null } }))
  }

  return {
    session,
    create,
    destroy,
  }
}
