import { PlusCircledIcon, StarFilledIcon } from '@radix-ui/react-icons'
import { Badge, Box, Button, Card, Container, Flex, Grid, Heading, Link, ScrollArea, Table, Text } from '@radix-ui/themes'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { AreaGraph } from './AreaGraph'
import { Money } from './Money'
import { RecentBet, TopBetResult, getBets, getCreators, getDailyVolume, getPlayers, getTopBets } from './api'
import { DailyVolume, getCreatorMeta } from './data'
import Marquee from 'react-fast-marquee'

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
    <Box my="4">
      <Heading mb="4" size="4">
        Recent bets on all platforms
      </Heading>
      <ScrollArea
        type="always"
        scrollbars="vertical"
        style={{
          width: '100%',
          height: 500,
        }}
      >
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                #
              </Table.ColumnHeaderCell>
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
                    {1 + i}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex align="baseline" gap="2">
                      <Link asChild>
                        <NavLink to={'/tx/' + transaction.signature}>
                          {creatorMeta.image ? (
                            <img src={creatorMeta.image} height="20px" width="20px" style={{ marginRight: '.5em', verticalAlign: 'middle' }} />
                          ) : (
                            <div style={{ display: 'inline-block', marginRight: '.5em', verticalAlign: 'middle', width: 20, height: 20, background: '#cccccc33', borderRadius: '50%' }} />
                          )}
                          {creatorMeta.name}
                          {/* {transaction.player} */}
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
                    <Badge color={payout >= transaction.wager ? 'green' : '#cccccc33'}>
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
      </ScrollArea>
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
      <Grid my="4" columns="2" style={{ gridTemplateColumns: 'auto 1fr' }}>
        <Text color="gray" style={{ padding: 10 }}>
          <StarFilledIcon />
          Top Plays
        </Text>
        <Marquee speed={33} pauseOnHover>
          <Flex gap="4" justify="between">
            {topBets.top_multiplier.slice(0, 12).map((x, i) => (
              <Link key={i} asChild>
                <NavLink to={'/tx/' + x.signature} style={{ borderRadius: '20px', padding: '0 5px' }}>
                  <Flex justify="center" gap="2" align="center">
                    <Text size="2" color="gray">
                      #{i + 1}{' '}
                    </Text>
                    <img src={getCreatorMeta(x.creator).image} height="20px" width="20px" />
                    <Badge size="1" color="green">
                      {(x.multiplier * 100 - 100).toFixed(0)}%
                    </Badge>
                    {/* <Text size="2" color="green">
                      <Money lamports={x.profit}></Money>
                    </Text> */}
                  </Flex>
                </NavLink>
              </Link>
            ))}
          </Flex>
        </Marquee>
      </Grid>
      <Heading mb="4">
        Stats from the last 30 days
      </Heading>
      <div style={{ height: '200px' }}>
        <AreaGraph dailyVolume={dailyVolume} />
      </div>
      <Box my="4">
        <Grid
          columns={{ initial: '2', sm: '3' }}
          gap="4"
        >
          <Box>
            <Card size="2">
              <Heading color="gray" size="5">
                Volume
              </Heading>
              <Text size="6" weight="bold">
                <Money lamports={totalVolume} />
              </Text>
            </Card>
          </Box>
          <Box>
            <Card size="2">
              <Heading color="gray" size="5">
                Players
              </Heading>
              <Text size="6" weight="bold">
                {uniquePlayers}
              </Text>
            </Card>
          </Box>
          <Box grow="1">
            <Card size="2">
              <Heading color="gray" size="5">
                Platforms
              </Heading>
              <Text size="6" weight="bold">
                {creators.length}
              </Text>
            </Card>
          </Box>
        </Grid>
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
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                Platform
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">
                Volume
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>

            {creators.slice(0, 10).map(({ creator, volume }, i) => {
              const creatorMeta = getCreatorMeta(creator)
              return (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Flex align="baseline" gap="2">
                      <Link asChild>
                        <a target="_blank" href={'https://explorer.solana.com/address/' + creator} rel="noreferrer">
                          {creatorMeta.image ? (
                            <img src={creatorMeta.image} height="20px" width="20px" style={{ marginRight: '.5em', verticalAlign: 'middle' }} />
                          ) : (
                            <div style={{ display: 'inline-block', marginRight: '.5em', verticalAlign: 'middle', width: 20, height: 20, background: '#cccccc33', borderRadius: '50%' }} />
                          )}
                          {creatorMeta.name}
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
      </Box>

      <RecentPlays />
    </Container>
  )
}
