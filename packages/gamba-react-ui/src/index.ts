import { useRecentPlays as useRecentPlaysGambaReact } from 'gamba-react'
import * as Svg from './Svg'
export { GambaConnectButton, GambaModalButton } from './GambaConnectButton'
export { GambaModal } from './GambaModal'
export { GambaUi } from './Provider'
export { ActionBar } from './components/ActionBar'
export { Button } from './components/Button'
export { ErrorBoundary } from './components/ErrorBoundary'
export { GameView } from './components/GameView'
export { Loader } from './components/Loader'
export { Modal } from './components/Modal'
export { ResponsiveSize } from './components/ResponsiveSize'
export { useGambaUi } from './context'
export * from './types'
export { formatLamports, copyTextToClipboard } from './utils'
export { Svg }

/**
 * @deprecated import from "gamba/react" instead
 */
export const useRecentPlays = useRecentPlaysGambaReact
