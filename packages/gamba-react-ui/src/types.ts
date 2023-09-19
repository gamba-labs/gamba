// import { GameResult } from 'gamba-core'
import React from 'react'

export interface GameBundle {
  /**
   * @deprecated Providing "creator" to the `Gamba` provider is sufficent. To override it, pass it as a parameter to `gamba.play`.
   * */
  creator?: string
  name: string
  short_name: string
  theme_color?: string
  description?: string
  image?: string
  links?: {url: string, title: string}[]
  app: (() => JSX.Element) | React.LazyExoticComponent<() => JSX.Element>
}
