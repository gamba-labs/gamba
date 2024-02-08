import { DailyVolume, fetchDailyTotalVolume, fetchTopPlayers } from "@/api"
import { BarChart } from "@/charts/BarChart"
import { PlayerAccountItem } from "@/components/AccountItem"
import { Card, Flex, Grid, Text } from "@radix-ui/themes"
import React from "react"
import { NavLink } from "react-router-dom"
import useSWR from "swr"
import { PoolList } from "./PoolList"
import { TopPlatforms } from "./TopPlatforms"

function TotalVolume() {
  const { data: daily = [] } = useSWR("daily-usd", fetchDailyTotalVolume)
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
      <div style={{height: '230px'}}>
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
    <Card size="2">
      <Flex direction="column" gap="2">
        <Text color="gray">Player Leaderboard</Text>
        {players.slice(0, 5).map((player, i) => (
          <Card key={i}>
            <Flex gap="2" justify="between">
              <NavLink to={"/player/" + player.user}>
                <PlayerAccountItem address={player.user} />
              </NavLink>
              <Text>
                +${player.usd_profit.toLocaleString(undefined, {maximumFractionDigits: 2})}
              </Text>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Card>
  )
}

export default function Dashboard() {
  return (
    <Flex direction="column" gap="4">
      <Grid gap="2" columns="2">
        <TotalVolume />
        <TopPlayers />
      </Grid>
      <Text color="gray">Top Pools</Text>
      <PoolList />
      <Text color="gray">Top Platforms this week</Text>
      <TopPlatforms />
      {/* <Text color="gray">Recent Plays</Text>
      <RecentPlays /> */}
    </Flex>
  )
}
