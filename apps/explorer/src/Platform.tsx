import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { Box, Button, Container, Dialog, Flex, Grid, Link, Table, Text } from '@radix-ui/themes'
import React from 'react'
import { useParams } from 'react-router-dom'
import { VolumeGraph } from './Dashboard'
import { Money } from './Money'
import { RecentPlays } from './RecentPlays'
import { daysAgo, seconds, useApi } from './api'
import { PlatformAccountItem, PlayerAccountItem } from './components/AccountItem'
import { TableRowNavLink } from './components/TableRowLink'
import { getCreatorMeta } from './data'
import { DocumentTitle } from './useDocumentTitle'

function Details({creator}: {creator: string}) {
  const meta = getCreatorMeta(creator)
  const { data: uniquePlayerData } = useApi('/unique-players', { creator })

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>
            <PlatformAccountItem address={creator} />
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Fee collector
              </Text>
              <Link target="_blank" href={`https://solscan.io/address/${creator}`} rel="noreferrer">
                {creator} <ExternalLinkIcon />
              </Link>
            </Grid>
          </Table.Cell>
        </Table.Row>

        {meta.url && (
          <Table.Row>
            <Table.Cell>
              <Grid columns="2" gap="4">
                <Text weight="bold">
                  URL
                </Text>
                <Dialog.Root>
                  <Dialog.Trigger>
                    <Link>
                      {meta.url?.split('https://')[1]}
                    </Link>
                  </Dialog.Trigger>
                  <Dialog.Content style={{ maxWidth: 450 }}>
                    <Dialog.Title>
                      Do your own research.
                    </Dialog.Title>
                    <Dialog.Description size="2">
                      Even though the platform is listed here, there is no garantuee that it is safe to interact with.
                    </Dialog.Description>

                    <Flex gap="3" mt="4" justify="end">
                      <Dialog.Close>
                        <Button variant="soft" color="gray">
                          Cancel
                        </Button>
                      </Dialog.Close>
                      <Dialog.Close>
                        <Button onClick={() => window.open(meta.url, '_blank')} role="link" variant="solid">
                          {meta.url} <ExternalLinkIcon />
                        </Button>
                      </Dialog.Close>
                    </Flex>
                  </Dialog.Content>
                </Dialog.Root>
              </Grid>
            </Table.Cell>
          </Table.Row>
        )}

        <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Players
              </Text>
              <Text>
                {uniquePlayerData?.unique_players}
              </Text>
            </Grid>
          </Table.Cell>
        </Table.Row>

      </Table.Body>
    </Table.Root>

  )
}

export function PlatformView() {
  const { address } = useParams<{address: string}>()
  const creator = address!
  const meta = getCreatorMeta(creator)
  const { data: topPlayersByWagerData } = useApi('/top-players/total-wager', { creator, start: seconds(daysAgo(7)) })
  const { data: topPlayersByProfitData } = useApi('/top-players/winners', { creator, start: seconds(daysAgo(7)) })

  return (
    <Container>
      <DocumentTitle title={meta.name} />
      {/* <Button color="green" onClick={() => setIFrame(true)}>Play now</Button> */}
      <Flex direction="column" gap="4">
        <VolumeGraph creator={address} />

        <Details creator={address!} />

        {topPlayersByWagerData?.players.length && topPlayersByProfitData?.players.length && (
          <>
            <Text color="gray">
              7d Leaderboard
            </Text>
            <Grid columns="2" gap="4">
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>
                      Top players by volume
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {topPlayersByWagerData?.players.slice(0, 6).map((player, i) => (
                    <TableRowNavLink key={i} to={`/player/${player.player}`} style={{flexGrow: '1'}}>
                      <Table.Cell>
                        <Flex gap="2" justify="between">
                          <PlayerAccountItem address={player.player} />
                          <Text color="green">
                            <Money lamports={player.total_wager} />
                          </Text>
                        </Flex>
                      </Table.Cell>
                    </TableRowNavLink>
                  ))}
                </Table.Body>
              </Table.Root>

              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>
                      Top earners
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {topPlayersByProfitData?.players.slice(0, 6).map((player, i) => (
                    <TableRowNavLink key={i} to={`/player/${player.player}`} style={{flexGrow: '1'}}>
                      <Table.Cell>
                        <Flex justify="between" gap="2">
                          <PlayerAccountItem address={player.player} />
                          <Text color="green">
                            +<Money lamports={player.net_wins} />
                          </Text>
                        </Flex>
                      </Table.Cell>
                    </TableRowNavLink>
                  ))}
                </Table.Body>
              </Table.Root>
            </Grid>
          </>
        )}

        <Box>
          <Grid gap="2">
            <Text color="gray">
              Recent plays
            </Text>
            <RecentPlays creator={address} />
          </Grid>
        </Box>
      </Flex>
    </Container>
  )
}
