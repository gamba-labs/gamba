import { DailyVolume, apiFetcher, fetchDailyTotalVolume, fetchTopPlayers, getApiUrl } from "@/api"
import { BarChart } from "@/charts/BarChart"
import { PlayerAccountItem } from "@/components/AccountItem"
import { Card, Flex, Grid, Text } from "@radix-ui/themes"
import React from "react"
import { NavLink } from "react-router-dom"
import useSWR from "swr"
import { PoolList } from "./PoolList"
import { TopPlatforms, UnstyledNavLink } from "./TopPlatforms"
import RecentPlays from "@/RecentPlays"

export function TotalVolume(props: {creator?: string}) {
  const { data: daily = [] } = useSWR<DailyVolume[]>(
    getApiUrl("/daily-usd", {creator: props.creator}),
    apiFetcher,
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

function TopPlayers() {
  const { data: players = [] } = useSWR("top-players", fetchTopPlayers)

  return (
    <Card>
      <Flex direction="column" gap="2">
        <Text color="gray">Profit leaderboard</Text>
        {players.slice(0, 5).map((player, i) => (
          <UnstyledNavLink key={i} to={"/player/" + player.user}>
            <Card>
              <Flex gap="4">
                <Text color="gray" style={{opacity: .5}}>
                  {i + 1}
                </Text>
                <Flex gap="2" justify="between" grow="1">
                  <PlayerAccountItem avatarSize="1" address={player.user} />
                  <Text>
                    +${player.usd_profit.toLocaleString(undefined, {maximumFractionDigits: 2})}
                  </Text>
                </Flex>
              </Flex>
            </Card>
          </UnstyledNavLink>
        ))}
      </Flex>
    </Card>
  )
}

export default function Dashboard() {
  return (
    <Flex direction="column" gap="4">
      <Grid gap="4" columns="2">
        <Flex direction="column" gap="4">
          <TotalVolume />
          <TopPlayers />
        </Flex>
        <TopPlatforms />
      </Grid>
      <Text color="gray">Top Pools</Text>
      <PoolList />
      <Text color="gray">Recent Plays</Text>
      <RecentPlays />
    </Flex>
  )
}
