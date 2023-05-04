import React from 'react'

export interface GameBundle {
  creator: string
  name: string
  short_name: string
  description?: string
  image?: string
  links?: {url: string, title: string}[]
  app: (() => JSX.Element) | React.LazyExoticComponent<() => JSX.Element>
}
