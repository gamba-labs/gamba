import { PlusCircledIcon, StarFilledIcon } from '@radix-ui/react-icons'
import { Badge, Box, Button, Card, Container, Flex, Grid, Heading, Link, ScrollArea, Table, Text } from '@radix-ui/themes'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { AreaGraph } from './AreaGraph'
import { Money } from './Money'
import { RecentBet, TopBetResult, getBets, getCreators, getDailyVolume, getPlayers, getTopBets } from './api'
import { DailyVolume, getCreatorMeta } from './data'
import Marquee from 'react-fast-marquee'
import { PlatformText } from './components/PlatformText'

const timeAgo = (time: number) => {
  const diff = Date.now() - time
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days >= 1) {
    return days + 'd ago'
  }
  if (hours >= 1) {
    return hours + 'h ago'
  }
  if (minutes >= 1) {
    return minutes + 'm ago'
  }
  return 'Just now'
}

function RecentPlays() {
  const [page, setPage] = React.useState(0)
  const latestPage = React.useRef(-1)
  const [recentBets, setRecentBets] = React.useState<RecentBet[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(
    () => {
      if (latestPage.current === page) {
        return
      }
      latestPage.current = page
      setLoading(true)
      getBets(page)
        .then((x) => setRecentBets((previous) => [...previous, ...x]))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
    , [page],
  )

  return (
    <Box>
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              Platform
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              Wager
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              Payout
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">
              Time
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {recentBets.map((transaction, i) => {
            const creatorMeta = getCreatorMeta(transaction.creator)
            const payout = transaction.wager * transaction.multiplier
            return (
              <Table.Row key={transaction.signature}>
                <Table.Cell>
                  <Flex align="baseline" gap="2">
                    <Link asChild>
                      <NavLink to={'/tx/' + transaction.signature}>
                        <PlatformText address={transaction.creator} />
                      </NavLink>
                    </Link>
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text mr="2">
                    <Money lamports={transaction.wager} />
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text mr="2">
                    <Money lamports={payout} />
                  </Text>
                  <Badge color={payout >= transaction.wager ? 'green' : 'gray'}>
                    {Math.abs(transaction.multiplier).toFixed(2)}x
                  </Badge>
                </Table.Cell>
                <Table.Cell align="right">
                  <Link asChild>
                    <NavLink to={'/tx/' + transaction.signature}>
                      {timeAgo(transaction.blockTime * 1000)}
                    </NavLink>
                  </Link>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
      <Box mt="2">
        <Button
          disabled={loading}
          onClick={() => setPage(page + 1)}
          variant="soft"
          style={{ width: '100%' }}
        >
          Load more <PlusCircledIcon />
        </Button>
      </Box>
      <Text color="gray" size="2">
        Recent bets are updated every 5 minutes.
      </Text>
    </Box>
  )
}

export function Dashboard() {
  const [dailyVolume, setDailyVolume] = React.useState<DailyVolume[]>([])
  const [creators, setCreators] = React.useState<{creator: string, volume: number}[]>([])
  const [uniquePlayers, setUniquePlayers] = React.useState(0)
  const [topBets, setTopBets] = React.useState<TopBetResult>({ top_multiplier: [], top_profit: [] })

  React.useEffect(() => {
    getDailyVolume().then(setDailyVolume).catch(console.error)
    getCreators().then(setCreators).catch(console.error)
    getPlayers().then(setUniquePlayers).catch(console.error)
    getTopBets().then(setTopBets).catch(console.error)
  }, [])

  const totalVolume = React.useMemo(() => {
    return creators.reduce((prev, creator) => prev + creator.volume, 0)
  }, [creators])

  return (
    <Container>
      <Grid gap="4">

        <Box>
          <Card size="2">
            <Grid columns="2" style={{ gridTemplateColumns: 'auto 1fr' }}>
              <Text color="gray" style={{ padding: 10 }}>
                <StarFilledIcon />
                Top Plays
              </Text>
              <Marquee speed={33} pauseOnHover>
                <Flex gap="4" justify="between">
                  {topBets.top_multiplier.slice(0, 12).map((x, i) => (
                    <Link tabIndex={-1} key={i} asChild>
                      <NavLink to={'/tx/' + x.signature} style={{ borderRadius: '20px', padding: '0 5px' }}>
                        <Flex justify="center" gap="2" align="center">
                          <Text color="gray">
                            #{i + 1}{' '}
                          </Text>
                          <img src={getCreatorMeta(x.creator).image} height="24px" width="24px" />
                          <Badge color="green">
                            {(x.multiplier * 100 - 100).toFixed(0)}%
                          </Badge>
                        </Flex>
                      </NavLink>
                    </Link>
                  ))}
                </Flex>
              </Marquee>
            </Grid>
          </Card>
        </Box>

        <Card size="2">
          <Text color="gray">30d Volume</Text>
          <Box style={{ height: '200px', width: '100%' }}>
            <AreaGraph dailyVolume={dailyVolume} />
          </Box>
        </Card>

        <Box>
          <Card size="2">
              <Grid
                columns={{ initial: '1', sm: '3' }}
                gap="2"
                align="center"
              >
              <Flex justify="center" gap="2">
                <Text color="gray">
                  Volume
                </Text>
                <Text weight="bold">
                  <Money lamports={totalVolume} />
                </Text>
              </Flex>
              <Flex justify="center" gap="4">
                <Text color="gray">
                  Players
                </Text>
                <Text weight="bold">
                  {uniquePlayers}
                </Text>
              </Flex>
              <Flex justify="center" gap="4">
                <Text color="gray">
                  Platforms
                </Text>
                <Text weight="bold">
                  {creators.length}
                </Text>
              </Flex>
            </Grid>
          </Card>
        </Box>

        {/* <Grid
          columns={{ sm: '2' }}
          gap="4"
        >

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
                {topBets.top_multiplier.slice(0, 6).map(({ signature, player, creator, multiplier }, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>
                      <Flex align="baseline" gap="2">
                        <Link asChild>
                          <NavLink to={'/tx/' + signature}>
                            {player}
                          </NavLink>
                        </Link>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <Badge color="green">
                        {multiplier.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}x
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Grid> */}

        <Box>
          <Grid gap="2">
            <Table.Root className="CreatorsTable" variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>
                    #
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    Platform
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell align="right">
                    Volume
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {creators.slice(0, 8).map((creator, i) => {
                  const { creator: address, volume } = creator
                  const creatorMeta = getCreatorMeta(address)
                  const index = creators.indexOf(creator)
                  return (
                    <Table.Row key={i} role="button">
                    <Table.Cell>
                      <Text>
                        {index + 1}
                      </Text>
                    </Table.Cell>
                      <Table.Cell>
                        <Flex align="baseline" gap="2">
                          <Link asChild>
                            <a title={address} target="_blank" href={'https://explorer.solana.com/address/' + address} rel="noreferrer">
                              <PlatformText address={address} />
                            </a>
                          </Link>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <Text>
                          <Money lamports={volume} />
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </Grid>
        </Box>

        <Box>
          <Grid gap="2">
            <Text color="gray">
              Recent plays on all platforms
            </Text>
            <RecentPlays />
          </Grid>
        </Box>
      </Grid>
    </Container>
  )
}
