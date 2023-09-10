import { BellIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Box, Button, Callout, Container, Flex, Popover, TextField } from '@radix-ui/themes'
import React from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import styles from './App.module.css'
import { Dashboard } from './Dashboard'
import { TransactionView } from './TransactionView'

export function App() {
  const [search, setSearch] = React.useState('')
  const navigate = useNavigate()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/tx/' + search)
    setSearch('')
  }

  return (
    <>
      <Box className={styles.header} p="4" mb="4">
        <Container>
          <Flex gap="4" align="center">
            <Box>
              <NavLink to="/">
                <img alt="Gamba" src="/logo.svg" width="30" height="30" />
              </NavLink>
            </Box>
            <Box grow="1">
              <form onSubmit={submit}>
                <TextField.Root size="3" variant="soft">
                  <TextField.Slot>
                    <MagnifyingGlassIcon height="16" width="16" />
                  </TextField.Slot>
                  <TextField.Input
                    color="gray"
                    placeholder="Search for bets, players or creators"
                    value={search}
                    onChange={(evt) => setSearch(evt.target.value)}
                  />
                </TextField.Root>
              </form>
            </Box>
            <Box>
              <Popover.Root>
                <Popover.Trigger>
                  <Button disabled size="3">
                    Mainnet Beta
                  </Button>
                </Popover.Trigger>
                <Popover.Content>
                  <Box grow="1">
                    <Flex direction="column" gap="3">
                      <Button variant="soft">
                        Mainnet Beta
                      </Button>
                    </Flex>
                  </Box>
                </Popover.Content>
              </Popover.Root>
            </Box>
          </Flex>
        </Container>
      </Box>
      <Container p="2">
        <Container mb="4">
          <Callout.Root>
            <Callout.Icon>
              <BellIcon />
            </Callout.Icon>
            <Callout.Text>
              Data displayed on the dashboard are samples.
            </Callout.Text>
          </Callout.Root>
        </Container>
        <Routes>
          <Route
            path="/"
            element={<Dashboard />}
          />
          <Route
            path="/tx/:txid"
            element={<TransactionView />}
          />
        </Routes>
      </Container>
    </>
  )
}
