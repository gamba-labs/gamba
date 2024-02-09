import { Badge, Box, Button, Flex, Table } from "@radix-ui/themes"
import { useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { BPS_PER_WHOLE, GambaEvent } from "gamba-core-v2"
import React from "react"
import useSWRInfinite from 'swr/infinite'

import { TokenAvatar } from "@/components"
import { TableRowNavLink } from "@/components/TableRowLink"

import { PlusIcon } from "@radix-ui/react-icons"
import { apiFetcher, getApiUrl, parseSignatureResponse } from "./api"
import { PlatformAccountItem, PlayerAccountItem } from "./components/AccountItem"
import { TokenValue2 } from "./components/TokenValue2"

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

export default function RecentPlays({ pool, creator, user }: {pool?: PublicKey | string, creator?: PublicKey | string, user?: PublicKey | string}) {
  const { connection } = useConnection()
  const {
    data = [],
    // data,
    mutate,
    size,
    error,
    setSize,
    isValidating,
    isLoading,
  } = useSWRInfinite(
    (index, previousData) => {
      return getApiUrl("/events/settledGames", {
        pool: pool?.toString(),
        creator: creator?.toString(),
        user: user?.toString(),
        page: index,
      })
    },
    async (endpoint) => {
      const data = await apiFetcher(endpoint) as any
      const signatures = data.signatures as string[]
      return parseSignatureResponse(connection, signatures)
    }
  )

  const events = React.useMemo(
    () => data.flat(),
    [data]
  )

  return (
    <Box>
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
          {events.map(
            event => {
              const game = event.data as GambaEvent<"GameSettled">["data"]
              const multiplier = game.bet[game.resultIndex.toNumber()] / BPS_PER_WHOLE
              const wager = game.wager.toNumber()
              const payout = multiplier * wager
              // const profit = payout - wager
              // const payout = event.result.wager * event.result.multiplier
              return (
                <TableRowNavLink to={"/tx/" + event.signature} key={event.signature}>
                  <Table.Cell>
                    <PlatformAccountItem avatarSize="1" address={game.creator} />
                  </Table.Cell>
                  <Table.Cell>
                    <PlayerAccountItem avatarSize="1" address={game.user} />
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="1" align="center">
                      <TokenAvatar
                        size="1"
                        mint={game.tokenMint}
                      />
                      <TokenValue2
                        amount={wager}
                        mint={game.tokenMint}
                      />
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="1" align="center">
                      <TokenAvatar
                        size="1"
                        mint={game.tokenMint}
                      />
                      <TokenValue2
                        amount={payout}
                        mint={game.tokenMint}
                      />
                      <Badge color={payout >= wager ? "green" : "gray"}>
                        {Math.abs(multiplier).toFixed(2)}x
                      </Badge>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <TimeDiff time={event.time} />
                  </Table.Cell>
                </TableRowNavLink>
              )
            },
          )}
        </Table.Body>
      </Table.Root>
      <Box mt="2">
        <Button
          disabled={isLoading || isValidating}
          onClick={() => setSize(size + 1)}
          variant="soft"
          style={{ width: '100%' }}
        >
          Load more <PlusIcon />
        </Button>
      </Box>
    </Box>
  )
}
