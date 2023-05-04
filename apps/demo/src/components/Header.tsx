import { GambaModalButton } from 'gamba/react-ui'
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr max-content;
  width: 100%;
  background: ${({ theme }) => theme.palette.background}EE;
  backdrop-filter: blur(10px);
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  padding: 10px 20px;
`

const StyledNavigationLink = styled(NavLink)<{$active: boolean}>`
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 1em;
  transition: color .1s, border .1s;
  white-space: nowrap;
  text-transform: uppercase;
`

function NavigationLink({ children, to }: React.PropsWithChildren<{to: string}>) {
  const { pathname } = useLocation()
  return (
    <StyledNavigationLink $active={pathname === to} to={to}>
      {children}
    </StyledNavigationLink>
  )
}

export function Header() {
  return (
    <Wrapper>
      <NavigationLink to="/">
        <img height={30} src="/icon-32.png" /> Gamba Demo
      </NavigationLink>
      <GambaModalButton />
    </Wrapper>
  )
}
