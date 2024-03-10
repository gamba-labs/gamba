import { PlatformTokenResponse, TopCreatorsData, useApi } from '@/api'
import { TokenAvatar, TokenName } from '@/components'
import { PlatformAccountItem } from '@/components/AccountItem'
import { Flex, Select } from '@radix-ui/themes'
import React from 'react'
import { TopPlayers, TopPlayersProps } from "./Dashboard/Dashboard"

const daysAgo = (daysAgo: number) => {
  const now = new Date()
  const then = new Date()
  then.setDate(now.getDate() - daysAgo)
  then.setHours(0)
  return then.getTime()
}

function startOfWeek() {
  var today = new Date
  var day = today.getDay() || 7
  if (day !== 1)
    today.setHours(-24 * (day - 1))
  return today.getTime()
}

const timeframes = ['Daily', 'Weekly', 'Monthly', 'All Time'] as const

export function PlayersView() {
  const [sortBy, setSortBy] = React.useState<TopPlayersProps['sortBy']>("usd_profit")
  const [creator, setCreator] = React.useState<undefined | string>("all")
  const [token, setToken] = React.useState<undefined | string>("all")
  const [time, setTime] = React.useState<typeof timeframes[number]>('Daily')
  const { data: tokens = [] } = useApi<PlatformTokenResponse>("/tokens", { creator: creator === "all" ? undefined : creator })
  const { data: platforms = [], isLoading } = useApi<TopCreatorsData[]>(
    "/platforms",
    {
      limit: 5000,
      sortBy: 'volume',
      days: 5000,
    }
  )

  React.useEffect(
    () => setToken("all"),
    [creator]
  )

  const startTime = (() => {
    if (time === 'Daily') return daysAgo(0)
    if (time === 'Weekly') return startOfWeek()
    if (time === 'Monthly') return daysAgo(30)
    return daysAgo(36524)
  })()

  return (
    <>
      <Flex direction="column" gap="4">
        <Flex gap="4" wrap="wrap">
          <Select.Root value={creator} onValueChange={setCreator}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="all">
                All Platforms
              </Select.Item>
              <Select.Group>
                {platforms.map((platform) => (
                  <Select.Item key={platform.creator} value={platform.creator}>
                    <PlatformAccountItem address={platform.creator} />
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>

          <Select.Root value={token} onValueChange={setToken}>
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Item value="all">
                  All Tokens
                </Select.Item>
                {tokens.map(({ token }) => (
                  <Select.Item key={token} value={token}>
                    <Flex gap="2">
                      <TokenAvatar size="1" mint={token} />
                      <TokenName mint={token} />
                    </Flex>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>

          <Select.Root value={time} onValueChange={setTime}>
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                {timeframes.map((time) => (
                  <Select.Item key={time} value={time}>
                    {time}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>
          <Select.Root value={sortBy} onValueChange={setSortBy}>
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Item value="usd_profit">
                  USD Profit
                </Select.Item>
                <Select.Item value="usd_volume">
                  USD Volume
                </Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Flex>

        <TopPlayers
          creator={creator === "all" ? undefined : creator}
          token={token === "all" ? undefined : token}
          startTime={startTime}
          sortBy={sortBy}
          limit={100}
        />
      </Flex>
    </>
  )
}
