import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Badge, Box, Card, Flex, Grid, Link, Text } from '@radix-ui/themes'
import React from 'react'
import Marquee from 'react-fast-marquee'
import { NavLink, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import useSWR from 'swr'
import { Graph } from './Graph'
import { Money } from './Money'
import { RecentPlays } from './RecentPlays'
import { CreatorsResponse, DailyVolume, TotalVolumeResponse, UniquePlayersResponse, apiFetcher, daysAgo, getApiUrl, seconds, useApi } from './api'
import { PlatformAccountItem, PlayerAccountItem } from './components/AccountItem'
import { getCreatorMeta } from './data'

const TopPlayLink = styled(NavLink)`
  text-decoration: none;
  cursor: pointer;
  color: unset;
`

const SkeletonCard = styled(Card)`
  overflow: hidden;
  background-color: #DDDBDD;
  border-radius: var(--radius-4);
  height: 59px;
  animation: skeleton-shine 1s linear infinite;

  @keyframes skeleton-shine {
    0%, 100% {
      background-color: #DDDBDD33;
    }
    50% {
      background-color: #DDDBDD22;
    }
  }
`

export function VolumeGraph({ creator }: { creator?: string }) {
  const { data, isLoading } = useApi('/daily-volume', { creator, start: seconds(daysAgo(30)) })
  const [hovered, setHovered] = React.useState<DailyVolume | null>(null)

  const totalVolume = React.useMemo(() =>
    data?.daily_volumes.reduce((prev, creator) => prev + creator.total_volume, 0) ?? 0
  , [data])

  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <Text color="gray">
          {hovered?.date ? new Date(hovered.date).toLocaleString(undefined, {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '30d Volume'}
        </Text>
        <Text size="7" weight="bold">
          <Money lamports={hovered?.total_volume ?? totalVolume} />
        </Text>
      </Flex>
      <div style={{height: '200px'}}>
        <Graph onHover={setHovered} dailyVolume={data?.daily_volumes ?? []} />
      </div>
    </Card>
  )
}

async function fetchStats() {
  const { creators } = await apiFetcher<CreatorsResponse>(getApiUrl('/stats/creators'))
  const { total_volume } = await apiFetcher<TotalVolumeResponse>(getApiUrl('/total-volume'))
  const { unique_players } = await apiFetcher<UniquePlayersResponse>(getApiUrl('/unique-players'))
  return {creators, total_volume, unique_players}
}

function AllTimeStats() {
  const {data, isLoading} = useSWR('stats', fetchStats)

  if (isLoading) return <SkeletonCard size="2" />

  return (
    <Card size="2">
      <Grid
        gap="9"
        columns="3"
        align="center"
        justify="center"
      >
        <Flex gap="2" justify="center">
          <Text color="gray">
            Total Volume
          </Text>
          <Text weight="bold">
            <Money lamports={data?.total_volume ?? 0} />
          </Text>
        </Flex>
        <Flex gap="2" justify="center">
          <Text color="gray">
            Players
          </Text>
          <Text weight="bold">
            {data?.unique_players ?? 0}
          </Text>
        </Flex>
        <Flex gap="2" justify="center">
          <Text color="gray">
            Platforms
          </Text>
          <Text weight="bold">
            {data?.creators.length}
          </Text>
        </Flex>
      </Grid>
    </Card>
  )
}

function TopPlays() {
  const { data, isLoading } = useApi('/stats/top-bets', {start: seconds(daysAgo(2))})
  return (
    <Card size="1">
      <Grid columns="2" style={{ gridTemplateColumns: 'auto 1fr' }}>
        <Flex gap="2" p="2" align="center" pr="4">
          <Text color="gray">
            Top Plays today
          </Text>
        </Flex>
        <Marquee delay={2} speed={33} pauseOnHover>
          <Flex gap="4" justify="between">
            {data?.top_multiplier.slice(0, 10).map((x, i) => (
              <TopPlayLink key={i} to={'/play/' + x.signature} style={{ borderRadius: '20px', padding: '0 5px' }}>
                <Flex justify="center" gap="2" align="center">
                  <Text style={{opacity: .5}} color="gray">
                    {i + 1}{' '}
                  </Text>
                  <img src={getCreatorMeta(x.creator).image} height="24px" width="24px" />
                  <Badge color="green">
                    {(x.multiplier).toFixed(1)}x
                  </Badge>
                </Flex>
              </TopPlayLink>
            ))}
          </Flex>
        </Marquee>
      </Grid>
    </Card>

  )
}

function TrendingPlatforms() {
  const { data, isLoading } = useApi('/stats/creators', { start: seconds(daysAgo(7)) })

  const sorted = React.useMemo(
    () =>
      data?.creators.sort((a, b) => b.volume - a.volume).slice(0, 10).filter((x) => x.volume > 1e8) ?? [],
    [data?.creators]
  )

  return (
    <Card size="2">
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Text color="gray">
            Top Platforms this week
          </Text>
          <Link asChild>
            <NavLink to="/platforms">
              <Flex gap="2" align="center">
                <Text size="2">
                  View all
                </Text>
                <ArrowRightIcon />
              </Flex>
            </NavLink>
          </Link>
        </Flex>
          <Flex direction="column" gap="2" pb="2">
            {isLoading && Array.from({length: 10}).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
            {sorted.map((platform, i) => (
              <TopPlayLink key={platform.creator} to={`/platform/${platform.creator}`}>
                <Card size="2">
                  <Flex align="center" gap="4">
                    <Text color="gray" style={{opacity: .5}}>
                      {1 + i}
                    </Text>
                    <PlatformAccountItem
                      avatarSize="1"
                      address={platform.creator}
                    />
                  </Flex>
                </Card>
              </TopPlayLink>
            ))}
          </Flex>
      </Flex>
    </Card>
  )
}

function Stats() {
  const { data: topPlayersData, isLoading } = useApi('/top-players/winners', { start: seconds(daysAgo(7))})

  return (
    <Card size="2">
      <Flex direction="column" gap="4">
        <Flex justify="between">
          <Text color="gray">
            Top Players this week
          </Text>
        </Flex>
        <Flex gap="2" direction="column">
          {isLoading && (
            Array.from({length: 5})
              .map((_, i) => <SkeletonCard key={i} />)
          )}
          {topPlayersData?.players.slice(0, 5).map((data, i) => (
            <TopPlayLink key={data.player} to={`/player/${data.player}`}>
              <Card size="2">
                <Flex align="center" justify="between">
                  <Flex align="center" gap="4">
                    <Text color="gray" style={{opacity: .5}}>
                      {1 + i}
                    </Text>
                    <PlayerAccountItem
                      // avatarSize="2"
                      address={data.player}
                    />
                  </Flex>
                  <Money lamports={data.net_wins} />
                </Flex>
              </Card>
            </TopPlayLink>
          ))}
        </Flex>
      </Flex>
    </Card>
  )
}

export function Dashboard() {
  return (
    <Flex direction="column" gap="4">

      <TopPlays />

      <AllTimeStats />

      <Grid gap="4" columns={{initial: '1', sm: '2'}}>
        <Flex gap="4" direction={{initial: 'column'}} style={{gridTemplateRows: 'auto 1fr'}}>
          <VolumeGraph />
          <Stats />
        </Flex>

        <TrendingPlatforms />
      </Grid>

      <Box>
        <Text color="gray">
          Recent Plays on all Platforms
        </Text>
      </Box>
      <RecentPlays />
    </Flex>
  )
}
