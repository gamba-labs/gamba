import { ClipboardIcon, InfoCircledIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { Badge, Box, Button, Callout, Card, Container, Flex, Grid, Heading, Link, ScrollArea, Table, Text } from '@radix-ui/themes'
import { useConnection } from '@solana/wallet-adapter-react'
import { GameResult, PROGRAM_ID, getGameResults, lamportsToSol } from 'gamba-core'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { AreaGraph } from './AreaGraph'
import { CREATORS, PLAYS } from './data'

function RecentPlays() {
  const { connection } = useConnection()
  const [results, setResults] = React.useState<GameResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const lastFetchSignature = React.useRef<string>()

  const loadMore = async () => {
    try {
      setLoading(true)
      const { results, signatures } = await getGameResults(connection, {
        signatureLimit: 25,
        address: PROGRAM_ID,
        before: lastFetchSignature.current,
      })
      const lastSignature = signatures.at(-1)
      if (lastFetchSignature.current === lastSignature) {
        return
      }
      lastFetchSignature.current = lastSignature
      setResults((prev) => [...prev, ...results])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(
    () => {
      loadMore()
    }
    , [])

  return (
    <Box my="4">
      <ScrollArea type="always" scrollbars="vertical" style={{ width: '100%', height: 300 }}>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
              Play
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">
              Payout
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {results.map((play) => {
              const multiplier = play.multiplier
              const payout = multiplier * play.wager
              const profit = payout - play.wager
              return (
                <Table.Row key={play.signature}>
                  <Table.Cell>
                    <Flex align="baseline" gap="2">
                      <Button variant="ghost" size="1">
                        <ClipboardIcon />
                      </Button>
                      <Link asChild>
                        <NavLink to={'/tx/' + play.signature}>
                          {play.signature.substring(0, 30)}...
                        </NavLink>
                      </Link>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Text mr="2">
                      {parseFloat(lamportsToSol(profit).toFixed(3))} SOL
                    </Text>
                    <Badge color={profit >= 0 ? 'green' : 'red'}>
                      {multiplier >= 1 ? '+' : '-'}
                      {Math.abs(multiplier * 100 - 100).toFixed(0)}%
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </ScrollArea>
      <Box my="4">
        <Button disabled={loading} onClick={loadMore} variant="soft" style={{ width: '100%' }}>
          Load more <PlusCircledIcon />
        </Button>
      </Box>
    </Box>
  )
}

export function Dashboard() {
  return (
    <Container>
      <Container mb="4">
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Data displayed on the dashboard are samples.
          </Callout.Text>
        </Callout.Root>
      </Container>
      <div style={{ height: '250px' }}>
        <AreaGraph />
      </div>
      <Box my="4">
        <Grid
          columns={{ initial: '2', sm: '4' }}
          gap="4"
        >
          <Box>
            <Card size="2">
              <Heading color="orange" size="5">
                Volume
              </Heading>
              <Text size="8" weight="bold">
                -
              </Text>
            </Card>
          </Box>
          <Box>
            <Card size="2">
              <Heading color="orange" size="5">
                Plays
              </Heading>
              <Text size="8" weight="bold">
                -
              </Text>
            </Card>
          </Box>
          <Box>
            <Card size="2">
              <Heading color="orange" size="5">
                Players
              </Heading>
              <Text size="8" weight="bold">
                -
              </Text>
            </Card>
          </Box>
          <Box grow="1">
            <Card size="2">
              <Heading color="orange" size="5">
                Creators
              </Heading>
              <Text size="8" weight="bold">
                -
              </Text>
            </Card>
          </Box>
        </Grid>
      </Box>

      <Grid
        columns={{ sm: '2' }}
        gap="4"
      >
        <Box>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>
                  Creator
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="right">
                  Volume
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>

              {CREATORS.map(({ address, meta, volume }, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Flex align="baseline" gap="2">
                      <Button variant="ghost" size="1">
                        <ClipboardIcon />
                      </Button>
                      <Link asChild>
                        <NavLink to={'/address/' + address}>
                          {meta?.name ?? (address.substring(0, 24) + '...')}
                        </NavLink>
                      </Link>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Text>
                      {volume.toLocaleString()} SOL
                    </Text>
                    {/* <Badge color="green">
                      <TriangleUpIcon />
                    </Badge> */}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

        <Box>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>
                  Play
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="right">
                  Payout
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {[...PLAYS].sort((a, b) => b.multiplier - a.multiplier).slice(0, 4).map(({ txid, profit, multiplier }, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Flex align="baseline" gap="2">
                      <Button variant="ghost" size="1">
                        <ClipboardIcon />
                      </Button>

                      <Link asChild>
                        <NavLink to={'/tx/' + txid}>
                          {txid.substring(0, 20)}...
                        </NavLink>
                      </Link>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Text mr="2">
                      {Math.abs(profit).toFixed(3).toLocaleString()} SOL
                    </Text>
                    <Badge color={profit >= 0 ? 'green' : 'red'}>
                      {multiplier >= 1 ? '+' : '-'}
                      {Math.abs(multiplier * 100 - 100).toFixed(0)}%
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Grid>

      <RecentPlays />
    </Container>
  )
}
