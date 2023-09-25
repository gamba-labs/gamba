import React from 'react'

import { GameUiContext } from './Provider'
export { default as Button } from './Button'
export { default as ControlView } from './ControlView'
export { default as Controls } from './Controls'
export { default as Fullscreen } from './Fullscreen'
export { default as Provider } from './Provider'
export { default as Group } from './Group'
export { default as View } from './View'
export { default as WagerInput } from './WagerInput'
export { default as Select } from './Select'

export { useSounds } from './useSounds'

export const useCurrentGame = () => {
  const context = React.useContext(GameUiContext)
  if (!context) {
    throw new Error('"useCurrentGame" can only be used inside of a <GameUi.Provider>')
  }
  return context.game
}
