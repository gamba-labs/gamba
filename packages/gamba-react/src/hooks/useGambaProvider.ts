import { useContext } from 'react'
import { GambaProviderContext } from '../provider'
import { useRerender } from './useRerender'
import { useEffect } from 'react'
import { RecentPlayEvent } from 'gamba-core'

export function useGambaProvider() {
  const rerender = useRerender()
  const { provider } = useContext(GambaProviderContext)

  useEffect(() => provider.house.onChange(rerender), [provider.house])
  useEffect(() => provider.onCreatorChanged(rerender), [provider.creator])

  return provider
}

export function useGambaEvent(callback: (event: RecentPlayEvent) => void) {
  const { provider } = useContext(GambaProviderContext)
  useEffect(() => provider.onEvent(callback), [provider])
}
