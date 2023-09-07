
export { GameControls, useInputContext } from './GameControls'
export { ErrorBoundary } from './ErrorBoundary'
export { GameContext, GameProvider } from './GameProvider'
export { ResponsiveSize } from './ResponsiveSize'
export * from './hooks'
export * from './types'
export { formatLamports } from './utils'

// export interface GameBundle2<T extends object> {
//   app: (() => JSX.Element) | React.LazyExoticComponent<() => JSX.Element>

//   meta: {
//     name: string
//     short_name: string
//     theme_color?: string
//     description?: string
//     image?: string
//     links?: {url: string, title: string}[]
//     developer: string
//   }

//   config: T
// }

// export const createGameBundle = <T extends object>(bundle: (config: T) => GameBundle2<T>) => bundle
