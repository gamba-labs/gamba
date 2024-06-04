import RecentPlays from "@/RecentPlays"
import { DailyVolume, TopPlayersResponse, useApi } from "@/api"
import { BarChart } from "@/charts/BarChart"
import { PlayerAccountItem } from "@/components/AccountItem"
import { SkeletonBarChart, SkeletonCardList } from "@/components/Skeleton"
import { Badge, Card, Flex, Grid, Link, Text } from "@radix-ui/themes"
import { PublicKey } from "@solana/web3.js"
import React from "react"
import { NavLink } from "react-router-dom"
import { DetailCards } from "../Platform/PlatformView"
import { PoolList } from "./PoolList"
import { TopPlatforms, UnstyledNavLink } from "./TopPlatforms"

export function TotalVolume(props: {creator?: string}) {
  const { data: daily = [], isLoading } = useApi<DailyVolume[]>(
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
        {isLoading && <SkeletonBarChart />}
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
          <SkeletonCardList cards={4} />
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

// WIP
// function PoolCard({pool}: {pool: PoolsResponse['pools'][number]}) {
//   const getTokenMeta = useTokenMeta(pool.token)

//   return (
//     <UnstyledNavLink to={`/pool/${pool.pool}`}>
//       <Card style={{width: '200px'}}>
//         <Flex direction="column" gap="2" align="center">
//           <TokenAvatar mint={pool.token} />
//           <Text size="4">{getTokenMeta.name}</Text>
//           <Flex justify="between">
//             <Text>
//               ${pool.tvl.toLocaleString()}
//             </Text>
//           </Flex>
//         </Flex>
//       </Card>
//     </UnstyledNavLink>
//   )
// }

// function PoolList2() {
//   const { data = { pools: [] }, isLoading } = useApi<PoolsResponse>("/pools")

//   console.log(data)
//   return (
//     <Flex gap="4" wrap="wrap">
//       {data.pools.map((pool, i) => (
//         <PoolCard key={pool.pool} pool={pool} />
//       ))}
//     </Flex>
//   )
// }

export default function Dashboard() {
  return (
    <Flex direction="column" gap="4">

      <DetailCards />

      <Grid gap="4" columns={{initial: '1', sm: '2'}}>
        <Flex direction="column" gap="4">
          <TotalVolume />
          <Card>
            <Flex direction="column" gap="2">
              <Flex justify="between">
                <Text color="gray">7d Leaderboard</Text>
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
              <Text color="gray">Top Platforms this week</Text>
              <Link asChild>
                <NavLink to="/platforms">View all</NavLink>
              </Link>
            </Flex>
            <TopPlatforms />
          </Flex>
        </Card>
      </Grid>
      <Flex justify="between">
        <Text color="gray">Top Pools</Text>
        <Link asChild>
          <NavLink to="/pools">View all</NavLink>
        </Link>
      </Flex>
      <PoolList />
      <Text color="gray">Recent Plays</Text>
      <RecentPlays />
    </Flex>
  )
}
