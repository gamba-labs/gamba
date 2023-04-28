import React from 'react'

export interface GameBundle {
  name: string
  shortName: string
  creator: string
  app: (() => JSX.Element) | React.LazyExoticComponent<() => JSX.Element>
  icon: () => JSX.Element
  loadScreen?: () => JSX.Element
}
