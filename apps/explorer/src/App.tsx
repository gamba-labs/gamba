import { ExternalLinkIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Box, Container, Flex, Link, TextField } from '@radix-ui/themes'
import React from 'react'
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { AllPlatforms } from './AllPlatforms'
import { Dashboard } from './Dashboard'
import { PlatformView } from './Platform'
import { PlayView } from './PlayView'
import { PlayerView } from './Player'
import { isPubkey, isSignature } from './utils'

const Header = styled(Box)`
  background-color: var(--color-panel);
`

export function App() {
  const [search, setSearch] = React.useState('')
  const location = useLocation()
  const navigate = useNavigate()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const _search = search.trim()
    if (isSignature(_search)) {
      navigate('/play/' + _search)
    } else if (isPubkey(_search)) {
      navigate('/creator/' + _search)
    } else {
      return alert('Invalid signature or address')
    }
    setSearch('')
  }

  React.useEffect(() =>
    document.body.scrollTo({ top: 0, left: 0 })
  , [location.key])

  return (
    <>
      <Header p="2" px="4">
        <Container>
          <Flex gap="4" align="center">
            <NavLink to="/" style={{height: 40, width: 40, display: 'flex'}}>
              <img alt="Gamba Explorer" src="/logo.svg" height="40" />
            </NavLink>
            <Box grow="1">
              <form onSubmit={submit}>
                <TextField.Root size="3" variant="soft">
                  <TextField.Slot>
                    <MagnifyingGlassIcon height="16" width="16" />
                  </TextField.Slot>
                  <TextField.Input
                    color="gray"
                    placeholder="Search for transactions or addresses"
                    value={search}
                    onChange={(evt) => setSearch(evt.target.value)}
                  />
                </TextField.Root>
              </form>
            </Box>
            <Box>
              <Flex gap="4">
                <Link size="1" href="https://github.com/gamba-labs/gamba" target="_blank" rel="noreferrer">
                  Github <ExternalLinkIcon />
                </Link>
                <Link size="1" href="https://gamba.so" target="_blank" rel="noreferrer">
                  About <ExternalLinkIcon />
                </Link>
              </Flex>
            </Box>
          </Flex>
        </Container>
      </Header>
      <Container p="4">
        <Routes>
          <Route
            path="/"
            element={<Dashboard />}
          />
          <Route
            path="/platforms"
            element={<AllPlatforms />}
          />
          <Route
            path="/tx/:txid"
            element={<PlayView />}
          />
          <Route
            path="/play/:txid"
            element={<PlayView />}
          />
          <Route
            path="/platform/:address"
            element={<PlatformView />}
          />
          <Route
            path="/player/:address"
            element={<PlayerView />}
          />
        </Routes>
      </Container>
    </>
  )
}
