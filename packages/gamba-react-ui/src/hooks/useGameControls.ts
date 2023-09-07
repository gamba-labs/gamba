import React from 'react'
import { GameControlDefinition } from '../types'
import { useControlsStore } from './useControlsStore'

export function useGameControls<T extends GameControlDefinition>(controls: T) {
  const setGameControls = useControlsStore((s) => s.setGameControls)

  React.useEffect(
    () => {
      setGameControls(controls)
      return () => setGameControls({})
    },
    [controls],
  )

  return controls
}
