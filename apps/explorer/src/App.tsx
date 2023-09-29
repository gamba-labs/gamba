import { InfoCircledIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Box, Button, Callout, Container, Flex, Popover, TextField } from '@radix-ui/themes'
import React from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { AddressView } from './Address'
import styles from './App.module.css'
import { Dashboard } from './Dashboard'
import { TransactionView } from './TransactionView'
import { isPubkey, isSignature } from './utils'

export function App() {
  const [search, setSearch] = React.useState('')
  const navigate = useNavigate()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const _search = search.trim()
    if (isPubkey(_search)) {
      navigate('/address/' + _search)
    } else if (isSignature(_search)) {
      navigate('/tx/' + _search)
    } else {
      return alert('Not a valid transaction or address')
    }
    setSearch('')
  }

  return (
    <>
      <Box className={styles.header} p="4" mb="4">
        <Container>
          <Flex gap="4" align="center">
            <Box>
              <NavLink to="/">
                <img alt="Gamba Explorer" src="/logo2.svg" height="35" />
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
                    placeholder="Search for transactions or addresses"
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
      <Container p="4">
        {/* <Container mb="4">
          <Callout.Root color="red">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              The explorer is in Beta. Come back soon for more stats and filtering options!
            </Callout.Text>
          </Callout.Root>
        </Container> */}
        <Routes>
          <Route
            path="/"
            element={<Dashboard />}
          />
          <Route
            path="/tx/:txid"
            element={<TransactionView />}
          />
          <Route
            path="/address/:address"
            element={<AddressView />}
          />
        </Routes>
      </Container>
    </>
  )
}
