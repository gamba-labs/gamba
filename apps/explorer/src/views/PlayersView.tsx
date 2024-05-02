import { PlatformTokenResponse, TopCreatorsData, useApi } from '@/api'
import { TokenAvatar, TokenName } from '@/components'
import { PlatformAccountItem } from '@/components/AccountItem'
import { Flex, Select } from '@radix-ui/themes'
import React from 'react'
import { TopPlayers, TopPlayersProps } from "./Dashboard/Dashboard"
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { PLATFORMS } from '@/platforms'

const daysAgo = (daysAgo: number) => {
  const now = new Date()
  const then = new Date()
  then.setDate(now.getDate() - daysAgo)
  then.setHours(0)
  then.setMinutes(0)
  then.setSeconds(0)
  return then.getTime()
}

function startOfWeek() {
  const d = new Date
  const day = d.getDay()
  const diff = d.getDate() - day + (day == 0 ? -6 : 1)
  const then = new Date(d.setDate(diff))
  then.setHours(0)
  then.setMinutes(0)
  then.setSeconds(0)
  return then.getTime()
}

const timeframes = ['Daily', 'Weekly', 'Monthly', 'All Time'] as const

function useLeaderboardParams(): LeaderboardParams {
  const { search } = useLocation()
  const params = new URLSearchParams(search)

  return {
    creator: params.get("creator") ?? "all",
    token: params.get("token") ?? "all",
    sortBy: params.get("sortBy") ?? "usd_profit",
    time: params.get("time") ?? "All Time",
  }
}

interface LeaderboardParams {
  creator: string
  token: string
  sortBy: string
  time: string
}

export function PlayersView() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useLeaderboardParams()
  const { data: tokens = [] } = useApi<PlatformTokenResponse>("/tokens", { creator: params.creator === "all" ? undefined : params.creator })

  const { data: platforms = [], isLoading } = useApi<TopCreatorsData[]>(
    "/platforms",
    {
      limit: 5000,
      sortBy: 'volume',
      days: 5000,
    }
  )

  // Show as many creators as possible in the platform dropdown
  // (one provided via query, known creators, and fetched ones)
  const allCreators = React.useMemo(
    () => {
      const c = platforms.map((x) => x.creator)
      if (params.creator !== 'all') {
        c.push(params.creator)
      }
      c.push(...PLATFORMS.map((x) => x.address))
      return Array.from(new Set(c))
    },
    [params.creator, platforms]
  )

  React.useEffect(
    () => {
      setParams({token: "all"})
    },
    [params.creator]
  )

  console.log(params)

  const setParams = (p: Partial<LeaderboardParams>) => {
    navigate({
      pathname: location.pathname,
      search: createSearchParams({
        ...params,
        ...p,
      }).toString()
    })
  }

  const startTime = (() => {
    if (params.time === 'Daily') return daysAgo(0)
    if (params.time === 'Weekly') return startOfWeek()
    if (params.time === 'Monthly') return daysAgo(30)
    return daysAgo(36524)
  })()

  return (
    <>
      <Flex direction="column" gap="4">
        <Flex gap="4" wrap="wrap">
          <Select.Root
            value={params.creator}
            onValueChange={(creator) => setParams({creator})}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="all">
                All Platforms
              </Select.Item>
              <Select.Group>
                {allCreators.map((creator) => (
                  <Select.Item key={creator} value={creator}>
                    <PlatformAccountItem address={creator} />
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>

          <Select.Root
            value={params.token}
            onValueChange={(token) => setParams({token})}
          >
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

          <Select.Root
            value={params.time}
            onValueChange={(time) => setParams({time})}
          >
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
          <Select.Root
            value={params.sortBy}
            onValueChange={(sortBy) => setParams({sortBy})}
          >
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
          creator={params.creator === "all" ? undefined : params.creator}
          token={params.token === "all" ? undefined : params.token}
          startTime={startTime}
          sortBy={params.sortBy as TopPlayersProps['sortBy']}
          limit={100}
        />
      </Flex>
    </>
  )
}
