import { ArrowRightIcon, StarFilledIcon } from '@radix-ui/react-icons'
import { Avatar, Badge, Box, Card, Container, Flex, Grid, Link, ScrollArea, Text } from '@radix-ui/themes'
import React from 'react'
import Marquee from 'react-fast-marquee'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { Graph } from './Graph'
import { Money } from './Money'
import { RecentPlays } from './RecentPlays'
import { daysAgo, seconds, useApi } from './api'
import { Loader } from './components/Loader'
import { DailyVolume, getCreatorMeta } from './data'

const TopPlayLink = styled(NavLink)`
  text-decoration: none;
  cursor: pointer;
  color: unset;
`

export function VolumeGraph({ creator }: {creator?: string}) {
  const { data, isLoading } = useApi('/daily-volume', { creator, start: seconds(daysAgo(30)) })
  const [hovered, setHovered] = React.useState<DailyVolume | null>(null)

  const totalVolume = React.useMemo(() =>
    data?.daily_volumes.reduce((prev, creator) => prev + creator.total_volume, 0) ?? 0
  , [data])

  return (
    <Card size="2" style={{width: '100%', overflow: 'hidden'}}>
      <Grid gap="2">
        <Text color="gray">
          {hovered?.date ? new Date(hovered.date).toLocaleString(undefined, {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '30d Volume'}
        </Text>
        <Text size="7" weight="bold">
          <Money lamports={hovered?.total_volume ?? totalVolume} />
        </Text>
      </Grid>
      <div style={{height: '200px'}}>
        <Graph onHover={setHovered} dailyVolume={data?.daily_volumes ?? []} />
      </div>
    </Card>
  )
}

function AllTimeStats() {
  const { data: creatorsData } = useApi('/stats/creators')
  const { data: totalVolumeData } = useApi('/total-volume')
  const { data: uniquePlayersData } = useApi('/unique-players')

  return (
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
            <Money lamports={totalVolumeData?.total_volume ?? 0} />
          </Text>
        </Flex>
        <Flex justify="center" gap="4">
          <Text color="gray">
            Players
          </Text>
          <Text weight="bold">
            {uniquePlayersData?.unique_players ?? 0}
          </Text>
        </Flex>
        <Flex justify="center" gap="4">
          <Text color="gray">
            Platforms
          </Text>
          <Text weight="bold">
            {creatorsData?.creators.length}
          </Text>
        </Flex>
      </Grid>
    </Card>
  )
}

function TrendingPlatforms() {
  const { data } = useApi('/stats/creators', { start: seconds(daysAgo(7)) })

  const sorted = React.useMemo(
    () => {
      return data?.creators.sort((a, b) => b.volume - a.volume).slice(0, 10).filter((x) => x.volume > 1e9)
    },
    [data?.creators]
  )

  if (!sorted?.length) return null

  return (
    <>
      <Flex gap="2" align="center" justify="between">
        <Text color="gray">
          Top Platforms this week
        </Text>
        <Link asChild>
          <NavLink to="/platforms">
            View all <ArrowRightIcon />
          </NavLink>
        </Link>
      </Flex>

      <ScrollArea>
        <Flex gap="2" pb="1">
          {sorted?.map((platform, i) => (
            <TopPlayLink key={platform.creator} to={`/platform/${platform.creator}`}>
              <Card size="2">
                <Grid gap="2">
                  <Flex justify="center">
                    <Avatar
                      size="2"
                      src={getCreatorMeta(platform.creator).image}
                      fallback={platform.creator.substr(0,3)}
                    />
                  </Flex>
                  <Text size="1" style={{width: '100px', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center', whiteSpace: 'nowrap'}}>
                    {getCreatorMeta(platform.creator).name}
                  </Text>
                </Grid>
                <Badge style={{position: 'absolute', right: 0, top: 0}}>
                  #{1 + i}
                </Badge>
              </Card>
            </TopPlayLink>
          ))}
        </Flex>
      </ScrollArea>
    </>
  )
}

export function Dashboard() {
  const { data, isLoading } = useApi('/stats/top-bets', {start: seconds(daysAgo(7))})

  if (isLoading || !data) {
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
      <Grid style={{maxWidth: '100%'}} gap="4">
        <Box>
          <Card size="1">
            <Grid columns="2" style={{ gridTemplateColumns: 'auto 1fr' }}>
              <Flex gap="2" p="2" align="center" pr="4">
                <StarFilledIcon />
                <Text color="gray">
                  Top plays
                </Text>
              </Flex>
              <Marquee delay={2} speed={33} pauseOnHover>
                <Flex gap="4" justify="between">
                  {data.top_multiplier.slice(0, 10).map((x, i) => (
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

        <AllTimeStats />

        <TrendingPlatforms />

        <Box>
          <Text color="gray">Recent Plays</Text>
        </Box>
        <RecentPlays />
      </Grid>
    </Container>
  )
}
