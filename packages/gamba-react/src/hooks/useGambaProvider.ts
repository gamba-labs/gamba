import { useContext } from 'react'
import { GambaProviderContext } from '../provider'
import { useRerender } from './useRerender'
import { useEffect } from 'react'

export function useGambaProvider() {
  const rerender = useRerender()
  const { provider } = useContext(GambaProviderContext)

  const addEvent = (event: any) => {
    // console.log('EBENT', event)
  }

  useEffect(() => provider.house.onChange(rerender), [provider.house])
  useEffect(() => provider.onCreatorChanged(rerender), [provider.creator])
  useEffect(() => provider.onEvent(addEvent), [provider])

  return provider
}
