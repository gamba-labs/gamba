import React from 'react'
import { useControlsStore } from './hooks/useControlsStore'
import { GameControl } from './types'

type ComponentImplementation = {
  [K in GameControl['type']]?: () => JSX.Element
}

interface InputContext<T> {
  value: T

  set: (value: T) => void

  control: GameControl
}

const InputContext = React.createContext<InputContext<number>>(null!)

export function useInputContext() {
  return React.useContext(InputContext)
}

/**
 *
 * @param props
 * @returns
 */
export function GameControls(props: ComponentImplementation) {
  const gameControls = useControlsStore((s) => s.gameControls)

  const _controls = React.useMemo(
    () => Object.entries(gameControls).map(([, control]) => control),
    [gameControls],
  )

  return _controls.map((control, i) => {
    const Comp = props[control.type]
    const value = 0
    const set = () => null

    if (!Comp) return <span key={i} style={{ color: 'red' }}>Unsupported!</span>

    return (
      <InputContext.Provider key={control.type} value={{ value, set, control }}>
        {<Comp />}
      </InputContext.Provider>
    )
  })
}
