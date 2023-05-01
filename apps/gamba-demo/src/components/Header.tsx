import { GambaModalButton, GameBundle, useGambaUi } from 'gamba/react-ui'
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useMediaQuery } from '../hooks'

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr max-content;
  width: 100%;
  background: ${({ theme }) => theme.palette.background}EE;
  backdrop-filter: blur(10px);
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
`

const NavigationBar = styled.div`
  display: flex;
  font-size: 18px;
  overflow-x: auto;
  &::scrollbar {
    height: .2em;
  }
  &::scrollbar-thumb {
    background-color: #ffffff;
  }
  @media(min-width:750px) {
    font-size: unset;
  }
`

const StyledNavigationLink = styled(NavLink)<{$active: boolean}>`
  padding: 10px 20px;
  text-decoration: none;
  color: ${({ $active, theme }) => $active ? theme.palette.primary : theme.palette.textColor};
  display: flex;
  align-items: center;
  gap: 1em;
  transition: color .1s, border .1s;
  white-space: nowrap;
  text-transform: uppercase;
  border-bottom: 3px solid ${({ $active, theme }) => $active ? theme.palette.primary : 'transparent'};
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
      <NavigationLink to="/">
        <img height={30} src="/icon-32.png" /> {displayName && 'Gamba Demo'}
      </NavigationLink>
      <NavigationBar>
        {games.map((game) => (
          <GameNavigationLink
            key={game.shortName}
            game={game}
          />
        ))}
      </NavigationBar>
      <div style={{ padding: 10 }}>
        <GambaModalButton />
      </div>
    </Wrapper>
  )
}
