import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

export const StyledHeader = styled.div`
  width: 100%;
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  padding: 10px;
  background: #000000CC;
  backdrop-filter: blur(50px);
  @media (min-height: 800px) {
    padding: 10px 20px;
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

export const Logo = styled(NavLink)`
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 1em;
  transition: background .2s;
  white-space: nowrap;
  border-radius: 5px;
  padding: 5px 10px;
  &:hover {
    background: #ffffff11;
  }
  & > img {
    height: 30px;
  }
`

export const Header: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Header>
      <div>
        <div>
          <Logo to="/">
            <img src="/logo.png" />
          </Logo>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {children}
        </div>
      </div>
    </Header>
  )
}
