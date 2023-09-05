import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { MenuButton } from './Menu'

const Logo = styled.img`
  height: 40px;
`

const Wrapper = styled.div`
  width: 100%;
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  padding: 5px;
  @media (min-height: 800px) {
    padding: 20px;
  }
  .label {
    display: none;
    @media (min-width: 800px) {
      display: block;
    }
  }
  > div {
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: start;
  }
`

const StyledNavigationLink = styled(NavLink)`
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 1em;
  transition: color .1s, border .1s;
  white-space: nowrap;
  text-transform: uppercase;
`

function NavigationLink({ children, to }: React.PropsWithChildren<{to: string}>) {
  return (
    <StyledNavigationLink to={to}>
      {children}
    </StyledNavigationLink>
  )
}

export function Header() {
  return (
    <Wrapper>
      <div>
        <NavigationLink to="/">
          <Logo src="/logo.png" />
        </NavigationLink>
        <MenuButton />
      </div>
    </Wrapper>
  )
}
