import { StarFilledIcon } from '@radix-ui/react-icons'
import { Badge, Box, Card, Container, Flex, Grid, Link, Table, Text } from '@radix-ui/themes'
import React from 'react'
import Marquee from 'react-fast-marquee'
import { NavLink } from 'react-router-dom'
import { Graph } from './Graph'
import { Money } from './Money'
import { END_TIME, TopBetResult, getCreators, getDailyVolume, getPlayers, getTopBets } from './api'
import { Loader } from './components/Loader'
import { PlatformText } from './components/PlatformText'
import { TableRowNavLink } from './components/TableRowLink'
import { DailyVolume, getCreatorMeta } from './data'
import styled from 'styled-components'
import { DocumentTitle } from './useDocumentTitle'

const TopPlayLink = styled(NavLink)`
  text-decoration: none;
  cursor: pointer;
`

export function VolumeGraph({ creator }: {creator?: string}) {
  const [dailyVolume, setDailyVolume] = React.useState<DailyVolume[]>([])
  const [hovered, setHovered] = React.useState<DailyVolume | null>(null)

  React.useEffect(() => {
    getDailyVolume(creator).then(setDailyVolume).catch(console.error)
  }, [])

  const totalVolume = React.useMemo(() => {
    return dailyVolume.reduce((prev, creator) => prev + creator.total_volume, 0)
  }, [dailyVolume])

  return (
    <Card size="2">
      <Grid gap="2">
        <Text color="gray">
          {hovered?.date ? new Date(hovered.date).toLocaleString(undefined, {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '30d Volume'}
        </Text>
        <Text size="7" weight="bold">
          <Money lamports={hovered?.total_volume ?? totalVolume} />
        </Text>
        <Box style={{height: '200px'}}>
          <Graph onHover={setHovered} dailyVolume={dailyVolume} />
        </Box>
      </Grid>
    </Card>
  )
}

function useDashboard() {
  const [loading, setLoading] = React.useState(true)
  const [creators, setCreators] = React.useState<{creator: string, volume: number}[]>([])
  const [uniquePlayers, setUniquePlayers] = React.useState(0)
  const [topBets, setTopBets] = React.useState<TopBetResult>({ top_multiplier: [], top_profit: [] })

  React.useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        setCreators(await getCreators())
        setUniquePlayers(await getPlayers({startTime: 0, endTime: END_TIME}))
        setTopBets(await getTopBets())
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return {loading, creators, uniquePlayers, topBets}
}

export function Dashboard() {
  const {loading, creators, topBets, uniquePlayers} = useDashboard()

  const totalVolume = React.useMemo(() => {
    return creators.reduce((prev, creator) => prev + creator.volume, 0)
  }, [creators])

  if (loading) {
    return (
      <Container>
        <Flex align="center" justify="center" p="4">
          <Loader />
        </Flex>
      </Container>
    )
  }

  return (
    <Container>
      <Grid gap="4">
        <Box>
          <Card size="1">
            <Grid columns="2" style={{ gridTemplateColumns: 'auto 1fr' }}>
              <Flex gap="2" p="2" align="center" pr="4">
                <StarFilledIcon />
                <Text color="gray">
                  Weekly best
                </Text>
              </Flex>
              <Marquee delay={2} speed={33} pauseOnHover>
                <Flex gap="4" justify="between">
                  {topBets.top_multiplier.slice(0, 10).map((x, i) => (
                    <TopPlayLink key={i} to={'/play/' + x.signature} style={{ borderRadius: '20px', padding: '0 5px' }}>
                      <Flex justify="center" gap="2" align="center">
                        <Text color="gray">
                          #{i + 1}{' '}
                        </Text>
                        <img src={getCreatorMeta(x.creator).image} height="24px" width="24px" />
                        <Badge color="green">
                          {(x.multiplier * 100 - 100).toFixed(0)}%
                        </Badge>
                      </Flex>
                    </TopPlayLink>
                  ))}
                </Flex>
              </Marquee>
            </Grid>
          </Card>
        </Box>

        <VolumeGraph />

        <Box>
          <Card size="2">
            <Grid
              columns={{ initial: '1', sm: '3' }}
              gap="2"
              align="center"
            >
              <Flex justify="center" gap="2">
                <Text color="gray">
                  Total Volume
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
                {creators.map((creator, i) => {
                  const { creator: address, volume } = creator
                  const creatorMeta = getCreatorMeta(address)
                  const index = creators.indexOf(creator)
                  return (
                    <TableRowNavLink key={i} to={'/platform/' + address}>
                    <Table.Cell>
                      <Text>
                        {index + 1}
                      </Text>
                    </Table.Cell>
                      <Table.Cell>
                        <PlatformText address={address} />
                      </Table.Cell>
                      <Table.Cell align="right">
                        <Text>
                          <Money lamports={volume} />
                        </Text>
                      </Table.Cell>
                    </TableRowNavLink>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </Grid>
        </Box>
      </Grid>
    </Container>
  )
}
