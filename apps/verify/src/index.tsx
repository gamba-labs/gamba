import { ArrowRightIcon, BellIcon, CheckIcon, ClipboardIcon, ExternalLinkIcon, MagnifyingGlassIcon, TriangleDownIcon, TriangleUpIcon } from '@radix-ui/react-icons'
import { Badge, Box, Button, Callout, Card, Code, Container, Flex, Grid, Heading, Link, Separator, Table, Text, TextField, Theme } from '@radix-ui/themes'
import { ConnectionProvider, useConnection } from '@solana/wallet-adapter-react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'

import '@radix-ui/themes/styles.css'
import './styles.css'
import styles from './styles.module.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

const examples = [
  { txid: '2D2dTDzcpi92JVrHfyLxeAe3RdMEVc895852RrzXFonJdp7dowGmw8xJ1Zfxmbz4q15QKzcTexngGXrRHnqYC72M', profit: 1.12 },
  { txid: '5skcoEBo8DrwoJT7St33WjBfMbh2icEo6mtgGNikd4FSjHzfMHKH199x8fjBLG8qwf5Ncq6mETs66XavvS2KV7rq', profit: .25 },
  { txid: '5K4mAXjhJEcGK6U2DBG8oobLRidNDWr3Sgcc19NaAVBDScEiGymBPicYvE72gBbFyU4uh6FMeK8MBCxvUKgrWxL2', profit: -.25 },
  { txid: '5K4mAXjhJEcGK6U2DBG8oobLRidNDWr3Sgcc19NaAVBDScEiGymBPicYvE72gBbFyU4uh6FMeK8MBCxvUKgrWxL2', profit: -.001 },
  { txid: '5K4mAXjhJEcGK6U2DBG8oobLRidNDWr3Sgcc19NaAVBDScEiGymBPicYvE72gBbFyU4uh6FMeK8MBCxvUKgrWxL2', profit: 6.01 },
  { txid: '5K4mAXjhJEcGK6U2DBG8oobLRidNDWr3Sgcc19NaAVBDScEiGymBPicYvE72gBbFyU4uh6FMeK8MBCxvUKgrWxL2', profit: 4.3 },
]

function Transaction() {
  const navigate = useNavigate()
  const { connection } = useConnection()
  const { txid } = useParams<{txid: string}>()
  const [logs, setLogs] = React.useState<string[]>([])

  React.useEffect(
    () => {
      connection.getParsedTransaction(txid!)
        .then((x) => {
          setLogs(x?.meta?.logMessages ?? [])
          // !nonce || !client || !rng || !rngHashed || !options
          // navigate(`/?nonce=${100}&options=1,2,3&rng_hash=1&client=321&rng=10`)
        })
    }
    , [txid])

  return (
    <Container>
      <Box my="4">
        <Heading mb="3" size="8">
          Transaction
        </Heading>

        <Flex gap="2">
          <Badge color="green" size="2">
            <CheckIcon />
          Verified Fair!
          </Badge>

          <Badge color="orange" size="2">
            <CheckIcon />
          Decent Odds
          </Badge>

          <Link target="_blank" href={`https://explorer.solana.com/tx/${txid}`} rel="noreferrer">
          View in Solana Explorer <ExternalLinkIcon />
          </Link>

        </Flex>
      </Box>

      <Heading as="h3">
        Bet Summary
      </Heading>

      <Box my="4">
        <Flex gap="4">
          <Card size="3">
            <Grid>
              <Heading color="gray" size="3">
                Win Chance
              </Heading>
              <Text size="8" weight="bold">
                50%
              </Text>
            </Grid>
          </Card>
          <Card size="3">
            <Grid>
              <Heading color="gray" size="3">
                Potential Win
              </Heading>
              <Text size="8" weight="bold">
                2x
              </Text>
            </Grid>
          </Card>
        </Flex>
      </Box>

      <Heading as="h3">
        Transaction Logs
      </Heading>

      <Box my="4">
        {logs.map((x, i) => (
          <Code size="2" key={i}>{x}</Code>
        ))}
      </Box>
    </Container>
  )
}

function Dashboard() {
  return (
    <Container>
      <Box my="4">
        <Heading as="h2" size="6" mb="4">
          30 day summary
        </Heading>
        <Grid columns="3" gap="4">
          <Box>
            <Card size="3">
              <Heading color="indigo" size="5">
                Volume
              </Heading>
              <Text size="8" weight="bold">
                152.32 SOL
              </Text>
            </Card>
          </Box>
          <Box>
            <Card size="3">
              <Heading color="orange" size="5">
                Players
              </Heading>
              <Text size="8" weight="bold">
                420
              </Text>
            </Card>
          </Box>
          <Box grow="1">
            <Card size="3">
              <Heading color="purple" size="5">
                Creators
              </Heading>
              <Text size="8" weight="bold">
                52
              </Text>
            </Card>
          </Box>
        </Grid>
      </Box>

      <Grid columns="2" gap="4">
        <Box>
          <Heading mb="4" size="5">
            Top Creators
          </Heading>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>
                  Creator
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  Volume
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>

              {examples.map(({ txid, profit }) => (
                <Table.Row key={txid}>
                  <Table.Cell>
                    <Flex align="baseline" gap="2">
                      <Button variant="ghost" size="1">
                        <ClipboardIcon />
                      </Button>

                      <Link asChild>
                        <NavLink to={'/tx/' + txid}>
                          {txid.substring(0, 6)}
                        </NavLink>
                      </Link>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="green">
                      512.32 SOL
                      <TriangleUpIcon />
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
        <Box>
          <Heading mb="4" size="5">
            Top Plays
          </Heading>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>
                  Play
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  Payout
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>

              {examples.map(({ txid, profit }) => (
                <Table.Row key={txid}>
                  <Table.Cell>
                    <Flex align="baseline" gap="2">
                      <Button variant="ghost" size="1">
                        <ClipboardIcon />
                      </Button>

                      <Link asChild>
                        <NavLink to={'/tx/' + txid}>
                          {txid.substring(0, 6)}
                        </NavLink>
                      </Link>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="green">
                      4.32 SOL
                      (4X)
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Grid>
      {/* <Separator my="3" size="4" /> */}

      <Box my="4">
        <Heading mb="4" size="5">
          Recent Plays
        </Heading>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                Play
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                Payout
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                Time
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {examples.map(({ txid, profit }) => (
              <Table.Row key={txid}>
                <Table.Cell>
                  <Flex align="baseline" gap="2">
                    <Button variant="ghost" size="1">
                      <ClipboardIcon />
                    </Button>

                    <Link asChild>
                      <NavLink to={'/tx/' + txid}>
                        {txid}
                      </NavLink>
                    </Link>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={profit >= 0 ? 'green' : 'red'}>
                    {Math.abs(profit).toFixed(3)} SOL
                    {profit >= 0 ? <TriangleUpIcon /> : <TriangleDownIcon />}
                  </Badge>
                </Table.Cell>
                <Table.Cell>Just now</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Container>
  )
}

function App() {
  return (
    <>
      <Box className={styles.header} p="4" mb="4">
        <Container>
          <Flex gap="4" align="center">
            <Box>
              <NavLink to="/">
                <img alt="Gamba" src="/logo.svg" height="30" />
              </NavLink>
            </Box>
            <Box grow="1">
              <TextField.Root size="3" variant="soft">
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
                <TextField.Input
                  color="gray"
                  placeholder="Search for bets, players or creators"
                />
              </TextField.Root>
            </Box>
          </Flex>
        </Container>
      </Box>
      <Container mb="4">
        <Callout.Root>
          <Callout.Icon>
            <BellIcon />
          </Callout.Icon>
          <Callout.Text>
            Explorer is in Beta. Everything displayed is fake data
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
          element={<Transaction />}
        />
      </Routes>
    </>
  )
}

root.render(
  <React.StrictMode>

    <ConnectionProvider
      endpoint={import.meta.env.GAMBA_SOLANA_RPC}
      config={{ wsEndpoint: import.meta.env.GAMBA_SOLANA_RPC_WS, commitment: 'confirmed' }}
    >
      <BrowserRouter>
        <Theme accentColor="iris" radius="medium" panelBackground="translucent">
          <App />
          {/* <ThemePanel /> */}
        </Theme>
      </BrowserRouter>
    </ConnectionProvider>
  </React.StrictMode>,
)
