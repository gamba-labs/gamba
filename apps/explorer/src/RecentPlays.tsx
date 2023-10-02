import { PlusCircledIcon } from '@radix-ui/react-icons'
import { Avatar, Badge, Box, Button, Flex, Table, Text } from '@radix-ui/themes'
import React from 'react'
import styled from 'styled-components'
import { Money } from './Money'
import { RecentBet, getBets } from './api'
import { PlatformAccountItem, PlayerAccountItem } from './components/AccountItem'
import { TableRowNavLink } from './components/TableRowLink'
import { truncateString } from './utils'

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

const Skeleton = styled.div`
  @keyframes skeleton-pulse {
    0%, 100% {
      opacity: 1
    }
    50% {
      opacity: .5
    }
  }
  display: inline-block;
  width: 420px;
  border-radius: 2px;
  background: #cccccc33;
  animation: skeleton-pulse 1s infinite ease;
`

export function RecentPlays({creator, player}: {creator?: string, player?: string}) {
  const [page, setPage] = React.useState(0)
  const latestPage = React.useRef(-1)
  const [recentBets, setRecentBets] = React.useState<RecentBet[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(
    () => {
      if (latestPage.current === page) {
        return
      }
      latestPage.current = page
      setLoading(true)
      getBets({page, creator, player})
        .then((x) => setRecentBets((previous) => [...previous, ...x]))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
    , [page],
  )

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
          {recentBets.map((transaction, i) => {
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
          })}
        </Table.Body>
      </Table.Root>
      <Box mt="2">
        <Button
          disabled={loading}
          onClick={() => setPage(page + 1)}
          variant="soft"
          style={{ width: '100%' }}
        >
          Load more <PlusCircledIcon />
        </Button>
      </Box>
      <Text color="gray" size="2">
        Recent bets are updated every 5 minutes.
      </Text>
    </Box>
  )
}
