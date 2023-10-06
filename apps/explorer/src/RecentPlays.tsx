import { PlusCircledIcon } from '@radix-ui/react-icons'
import { Badge, Box, Button, Table, Text } from '@radix-ui/themes'
import React from 'react'
import useSWRInfinite from 'swr/infinite'
import { Money } from './Money'
import { BetsResponse, apiFetcher, getApiUrl } from './api'
import { PlatformAccountItem, PlayerAccountItem } from './components/AccountItem'
import { TableRowNavLink } from './components/TableRowLink'

const timeAgo = (time: number) => {
  const diff = Date.now() - time
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days >= 1) {
    return days + 'd ago'
  }
  if (hours >= 1) {
    return hours + 'h ago'
  }
  if (minutes >= 1) {
    return minutes + 'm ago'
  }
  return 'Just now'
}

export function RecentPlays({creator, player}: {creator?: string, player?: string}) {
  const itemsPerPage = 10
  const {
    data,
    mutate,
    size,
    setSize,
    isValidating,
    isLoading,
  } = useSWRInfinite<BetsResponse>(
    (index) =>
      getApiUrl('/bets', {creator, player, limit: itemsPerPage, skip: index * itemsPerPage}),
    apiFetcher
  );


  return (
    <Box>
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            {!creator && (
              <Table.ColumnHeaderCell>
                Platform
              </Table.ColumnHeaderCell>
            )}
            {!player && (
              <Table.ColumnHeaderCell>
                Player
              </Table.ColumnHeaderCell>
            )}
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
          {data?.flatMap(
            (page) => page.bets.map(
              (transaction, i) => {
                const payout = transaction.wager * transaction.multiplier
                return (
                  <TableRowNavLink to={'/play/' + transaction.signature} key={transaction.signature}>
                    {!creator && (
                      <Table.Cell>
                        <PlatformAccountItem address={transaction.creator} />
                      </Table.Cell>
                    )}
                    {!player && (
                      <Table.Cell>
                        <PlayerAccountItem address={transaction.player} />
                      </Table.Cell>
                    )}
                    <Table.Cell>
                      <Text>
                        <Money lamports={transaction.wager} />
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text mr="2">
                        <Money lamports={payout} />
                      </Text>
                      <Badge color={payout >= transaction.wager ? 'green' : 'gray'}>
                        {Math.abs(transaction.multiplier).toFixed(2)}x
                      </Badge>
                    </Table.Cell>
                    <Table.Cell align="right">
                      {timeAgo(transaction.blockTime * 1000)}
                    </Table.Cell>
                  </TableRowNavLink>
                )
              }
            )
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
          Load more <PlusCircledIcon />
        </Button>
      </Box>
    </Box>
  )
}
