import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { GambaButton } from '../GambaButton'
import { useGambaUi } from '../context'
import { GameBundle } from '../types'
import useMediaQuery from '../useMediaQuery'

const Wrapper = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr max-content;
  width: 100%;
  background: ${({ theme }) => theme.palette.background};
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
`

const NavigationBar = styled.div`
  display: flex;
  gap: 20px;
`

const StyledNavigationLink = styled(NavLink)<{$active: boolean}>`
  color: unset;
  text-decoration: none;
  color: ${({ $active, theme }) => $active ? theme.palette.primary.main : '#fafafa'};
  display: flex;
  align-items: center;
  gap: 1em;
  transition: color .1s;
  text-transform: uppercase;
`

function GameNavigationLink({ game }: {game: GameBundle}) {
  const { pathname } = useLocation()
  const displayName = useMediaQuery('(min-width: 750px)')
  const path = '/' + game.shortName
  const label = null
  return (
    <StyledNavigationLink $active={pathname === path} to={path}>
      {game.icon && <game.icon />}
      {displayName && game.name} {displayName && label}
    </StyledNavigationLink>
  )
}

function NavigationLink({ children, to }: React.PropsWithChildren<{to: string}>) {
  const { pathname } = useLocation()
  return (
    <StyledNavigationLink $active={pathname === to} to={to}>
      {children}
    </StyledNavigationLink>
  )
}

export function Header() {
  const displayName = useMediaQuery('(min-width: 750px)')
  const games = useGambaUi((state) => state.games)
  return (
    <Wrapper>
      <NavigationBar>
        <NavigationLink to="/">
          <img height={40} src="/icon-192.png" /> {displayName && 'Gamba Portal'}
        </NavigationLink>
        {games.map((game) => (
          <GameNavigationLink
            key={game.shortName}
            game={game}
          />
        ))}
      </NavigationBar>
      <GambaButton />
    </Wrapper>
  )
}
