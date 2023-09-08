import React from 'react'
import { GameControlsSceme } from '../types'
import { useControlsStore } from './useControlsStore'

/**
 * To be used inside games
 * @param controls
 * @returns
 */
export function useGameControls(scheme: GameControlsSceme) {
  const setScheme = useControlsStore((s) => s.setScheme)
  const wager = useControlsStore((s) => s.wager)

  React.useEffect(
    () => {
      setScheme(scheme)
      return () => setScheme({})
    },
    [scheme],
  )
  return { wager }
}
