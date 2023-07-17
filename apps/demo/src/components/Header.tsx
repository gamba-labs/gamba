import { GambaConnectButton } from 'gamba/react-ui'
import React from 'react'
import { FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { GAMES } from '../games'
import { Dropdown } from './Dropdown'

const Logo = styled.img`
  width: 2em;
  height: 2em;
`

const Wrapper = styled.div`
  width: 100%;
  background: var(--header-bg-color);
  backdrop-filter: blur(10px);
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  padding: 10px 20px;
  .label {
    display: none;
    @media (min-width: 800px) {
      display: block;
    }
  }
  > div {
    margin: 0 auto;
    max-width: 90rem;
    gap: 20px;
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr max-content;
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

const Links = styled.div`
  display: flex;
  gap: 20px;
  font-size: 20px;
  align-items: center;
  & > a > svg {
    display: block;
  }
`

function NavigationLink({ children, to }: React.PropsWithChildren<{to: string}>) {
  return (
    <StyledNavigationLink to={to}>
      {children}
    </StyledNavigationLink>
  )
}

export function Header() {
  const navigate = useNavigate()
  const { shortName } = useParams()
  return (
    <Wrapper>
      <div>
        <NavigationLink to="/">
          <Logo src="/logo.png" />
          <div className="label">Gamba Demo</div>
        </NavigationLink>
        <Links>
          <a target="_blank" href="https://github.com/gamba-labs/gamba" rel="noreferrer">
            <FaGithub />
          </a>
          <a target="_blank" href="http://discord.gg/xjBsW3e8fK" rel="noreferrer">
            <FaDiscord />
          </a>
          <a target="_blank" href="https://twitter.com/GambaLabs" rel="noreferrer">
            <FaTwitter />
          </a>
        </Links>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Dropdown
            value={shortName}
            align="top"
            label="Game"
            onChange={(name) => navigate('/' + name)}
            options={GAMES.map((value) => ({
              label: value.name,
              value: value.short_name,
            }))}
          />
          <GambaConnectButton />
        </div>
      </div>
    </Wrapper>
  )
}
