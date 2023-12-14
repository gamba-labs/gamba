import { PublicKey } from '@solana/web3.js'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { GameBundle } from '.'
import { PortalProvider } from './PortalContext'

interface PlatformMeta {
  name: string
  creator: PublicKey
}

interface GambaPlatformTheme {
  button: {
    background: string
    backgroundHover: string
  }
}

interface GambaPlatformContext {
  platform: PlatformMeta
  games: GameBundle[]
  theme: GambaPlatformTheme
  token: PublicKey
  defaultCreatorFee: number
  defaultJackpotFee: number
  setToken: (token: PublicKey) => void
  clientSeed: string
  setClientSeed: (clientSeed: string) => void
}

export const GambaPlatformContext = React.createContext<GambaPlatformContext>(null!)

interface GambaPlatformProviderProps extends React.PropsWithChildren {
  platformName: string
  creator: string
  games: GameBundle[]
  theme: GambaPlatformTheme
  defaultCreatorFee?: number
  defaultJackpotFee?: number
}

export function GambaPlatformProvider(props: GambaPlatformProviderProps) {
  const { platformName, creator, children, games, theme } = props
  const [token, setToken] = React.useState(new PublicKey('So11111111111111111111111111111111111111112'))
  const [clientSeed, setClientSeed] = React.useState(String(Math.random() * 1e9 | 0))
  const defaultJackpotFee = props.defaultJackpotFee ?? 0.001
  const defaultCreatorFee = props.defaultCreatorFee ?? 0.01
  return (
    <GambaPlatformContext.Provider
      value={{
        platform: {
          name: platformName,
          creator: new PublicKey(creator),
        },
        games,
        theme,
        token,
        setToken,
        clientSeed,
        setClientSeed,
        defaultJackpotFee,
        defaultCreatorFee,
      }}
    >
      <PortalProvider>
        <ThemeProvider theme={{ gamba: theme }}>
          {children}
        </ThemeProvider>
      </PortalProvider>
    </GambaPlatformContext.Provider>
  )
}
