import { Badge, Button, Checkbox, Flex, Table, Text } from "@radix-ui/themes"
import { PublicKey } from "@solana/web3.js"
import React from "react"
import useSWRInfinite from 'swr/infinite'

import { TokenAvatar } from "@/components"
import { TableRowNavLink } from "@/components/TableRowLink"

import { PlusIcon } from "@radix-ui/react-icons"
import { RecentPlaysResponse, apiFetcher, getApiUrl } from "./api"
import { PlatformAccountItem, PlayerAccountItem } from "./components/AccountItem"
import { TokenValue2 } from "./components/TokenValue2"
import { Spinner } from "./components/Spinner"

export function TimeDiff({ time }: {time: number}) {
  const diff = (Date.now() - time)
  return React.useMemo(() => {
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours >= 24) {
      return Math.floor(hours / 24) + "d ago"
    }
    if (hours >= 1) {
      return hours + "h ago"
    }
    if (minutes >= 1) {
      return minutes + "m ago"
    }
    return "Just now"
  }, [diff])
}

interface RecentPlaysProps {
  pool?: PublicKey | string
  creator?: PublicKey | string
  user?: PublicKey | string
  onlyJackpots?: boolean
}

export default function RecentPlays({ pool, creator, user, onlyJackpots }: RecentPlaysProps) {
  const {
    data = [],
    size,
    setSize,
    isValidating,
    isLoading,
  } = useSWRInfinite(
    (index, previousData) =>
      getApiUrl("/events/settledGames", {
        onlyJackpots,
        pool: pool?.toString(),
        creator: creator?.toString(),
        user: user?.toString(),
        page: index,
        itemsPerPage: 10,
      }),
    async (endpoint) => {
      const data = await apiFetcher<RecentPlaysResponse>(endpoint)
      return { total: data.total, results: data.results }
    }
  )

  if (isLoading) {
    return (
      <Flex align="center" justify="center" gap="2">
        <Spinner />
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="2">
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              Platform
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              Player
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
          {data.flatMap(
            ({results}) => (
              results.map(
                (result) => {
                  return (
                    <TableRowNavLink to={"/tx/" + result.signature} key={result.signature}>
                      <Table.Cell>
                        <PlatformAccountItem avatarSize="1" address={result.creator} />
                      </Table.Cell>
                      <Table.Cell>
                        <PlayerAccountItem avatarSize="1" address={result.user} />
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="1" align="center">
                          <TokenAvatar
                            size="1"
                            mint={result.token}
                          />
                          <TokenValue2
                            amount={result.wager}
                            mint={result.token}
                          />
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="1" align="center">
                          <TokenAvatar
                            size="1"
                            mint={result.token}
                          />
                          <TokenValue2
                            amount={result.payout}
                            mint={result.token}
                          />
                          <Badge color={result.payout >= result.wager ? "green" : "gray"}>
                            {Math.abs(result.multiplier).toFixed(2)}x
                          </Badge>
                          {result.jackpot > 0 && (
                            <Badge color="pink">
                              JACKPOT
                            </Badge>
                          )}
                        </Flex>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <TimeDiff time={result.time} />
                      </Table.Cell>
                    </TableRowNavLink>
                  )
                },
              )
            )
          )}
        </Table.Body>
      </Table.Root>
      <Button
        disabled={isLoading || isValidating}
        onClick={() => setSize(size + 1)}
        variant="soft"
        size="3"
        style={{ width: '100%' }}
      >
        Load more <PlusIcon />
      </Button>
    </Flex>
  )
}
