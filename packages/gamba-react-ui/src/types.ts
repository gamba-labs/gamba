export interface GameBundle {
  name: string
  shortName: string
  creator: string
  app: () => JSX.Element
}
