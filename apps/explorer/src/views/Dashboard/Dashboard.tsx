import RecentPlays from "@/RecentPlays"
import { DailyVolume, TopPlayersResponse, useApi } from "@/api"
import { BarChart } from "@/charts/BarChart"
import { PlayerAccountItem } from "@/components/AccountItem"
import { Badge, Card, Flex, Grid, Link, Text } from "@radix-ui/themes"
import { PublicKey } from "@solana/web3.js"
import React from "react"
import { NavLink } from "react-router-dom"
import styled from "styled-components"
import { Things } from "../Platform/PlatformView"
import { PoolList } from "./PoolList"
import { TopPlatforms, UnstyledNavLink } from "./TopPlatforms"

export function TotalVolume(props: {creator?: string}) {
  const { data: daily = [] } = useApi<DailyVolume[]>(
    "/chart/daily-usd",
    {creator: props.creator},
  )
  const [hovered, setHovered] = React.useState<DailyVolume | null>(null)
  const total = React.useMemo(
    () => daily.reduce((p, x) => p + x.total_volume, 0),
    [daily]
  )

  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <Text color="gray">
          {hovered?.date ? new Date(hovered.date).toLocaleString(undefined, {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '7d Volume'}
        </Text>
        <Text size="7" weight="bold">
          ${(hovered?.total_volume ?? total).toLocaleString(undefined, {maximumFractionDigits: 1})}
        </Text>
      </Flex>
      <div style={{height: '200px'}}>
        <BarChart
          dailyVolume={daily}
          onHover={setHovered}
        />
      </div>
    </Card>
  )
}

const WEEK = Date.now() - 604800000

export interface TopPlayersProps {
  creator?: PublicKey | string
  limit?: number
  startTime?: number
  token?: PublicKey | string
  sortBy?: 'usd_volume' | 'usd_profit'
}

export function TopPlayers({
  token,
  creator,
  limit = 5,
  startTime = WEEK,
  sortBy = 'usd_profit'
}: TopPlayersProps) {
  const { data = { players: [] }, isLoading } = useApi<TopPlayersResponse>(
    "/players",
    {
      creator: creator?.toString(),
      token: token?.toString(),
      limit,
      sortBy,
      startTime,
    }
  )

  return (
    <>
      <Flex direction="column" gap="2">
        {isLoading && !data.players.length &&
          Array.from({length: 4})
            .map(
              (_, i) => <SkeletonCard key={i} />
            )
        }
        {data.players
          .map((player, i) => (
            <UnstyledNavLink key={i} to={"/player/" + player.user}>
              <Card>
                <Flex gap="4">
                  <Text color="gray" style={{opacity: .5}}>
                    {i + 1}
                  </Text>
                  <Flex gap="2" justify="between" grow="1">
                    <PlayerAccountItem avatarSize="1" address={player.user} />
                    <Flex gap="2" align="center">
                      <Text color="gray" size="2">
                        ${player.usd_volume.toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </Text>
                      <Badge color={player.usd_profit >= 0 ? "green" : "gray"}>
                        {player.usd_profit >= 0 ? '+' : '-'}${Math.abs(player.usd_profit).toLocaleString(undefined, {maximumFractionDigits: 2})}
                      </Badge>
                    </Flex>
                  </Flex>
                </Flex>
              </Card>
            </UnstyledNavLink>
          ))}
      </Flex>
    </>
  )
}

const SkeletonCard = styled(Card)`
  overflow: hidden;
  background-color: #DDDBDD;
  border-radius: var(--radius-4);
  height: 56px;
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

export default function Dashboard() {
  return (
    <Flex direction="column" gap="4">
      <Things />
      <Grid gap="4" columns={{initial: '1', sm: '2'}}>
        <Flex direction="column" gap="4">
          <TotalVolume />
          <Card>
            <Flex direction="column" gap="2">
              <Flex justify="between">
                <Text color="gray">Players</Text>
                <Link asChild>
                  <NavLink to="/leaderboard">View all</NavLink>
                </Link>
              </Flex>
              <TopPlayers />
            </Flex>
          </Card>
        </Flex>


        <Card>
          <Flex direction="column" gap="2">
            <Flex justify="between">
              <Text color="gray">Platforms</Text>
              <Link asChild>
                <NavLink to="/platforms">View all</NavLink>
              </Link>
            </Flex>
            <TopPlatforms />
          </Flex>
        </Card>

      </Grid>
      <Text color="gray">Top Pools</Text>
      <PoolList />
      <Text color="gray">Recent Plays</Text>
      <RecentPlays />
    </Flex>
  )
}
