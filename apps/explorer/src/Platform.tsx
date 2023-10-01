import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { Box, Button, Card, Container, Dialog, Flex, Grid, Link, Table, Text } from '@radix-ui/themes'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Graph } from './Graph'
import { Money } from './Money'
import { RecentPlays } from './RecentPlays'
import { TopBetResult, TopPlayer, TopPlayerWager, getDailyVolume, getPlayers, getTopBets, getTopPlayers, getTopPlayersByWager } from './api'
import { Loader } from './components/Loader'
import { PlatformText } from './components/PlatformText'
import { TableRowNavLink } from './components/TableRowLink'
import { DailyVolume, getCreatorMeta } from './data'
import { truncateString } from './utils'
import { DocumentTitle } from './useDocumentTitle'

function usePlatform(creator: string) {
  const meta = getCreatorMeta(creator)
  const [loading, setLoading] = React.useState(true)
  const [uniquePlayers, setUniquePlayers] = React.useState(0)
  const [topPlayers, setTopPlayers] = React.useState<TopPlayer[]>([])
  const [topBets, setTopBets] = React.useState<TopBetResult>(null!)
  const [topPlayersByWager, setTopPlayersByWager] = React.useState<TopPlayerWager[]>([])
  const [dailyVolume, setDailyVolume] = React.useState<DailyVolume[]>([])

  React.useEffect(
    () => {
      const fetch = async () => {
        try {
          setLoading(true)
          setTopBets(await getTopBets({creator}))
          setDailyVolume(await getDailyVolume(creator))
          setUniquePlayers(await getPlayers({creator: creator, startTime: 0, endTime: Date.now()}))
          setTopPlayers(await getTopPlayers({creator: creator}))
          setTopPlayersByWager(await getTopPlayersByWager({creator: creator}))
        } finally {
          setLoading(false)
        }
      }
      fetch()
    },
    [creator]
  )

  return {meta, topBets, uniquePlayers, dailyVolume, topPlayers, topPlayersByWager, loading}
}

export function PlatformView() {
  const { address } = useParams<{address: string}>()
  const { meta, uniquePlayers, dailyVolume, topPlayers, topPlayersByWager, loading } = usePlatform(address!)
  const [hovered, setHovered] = React.useState<DailyVolume | null>(null)

  const totalVolume = React.useMemo(() => {
    return dailyVolume.reduce((prev, creator) => prev + creator.total_volume, 0)
  }, [dailyVolume])

  if (loading) {
    return (
      <Container>
        <DocumentTitle title={meta.name} />
        <Flex justify="center" align="center" p="4">
          <Loader />
        </Flex>
      </Container>
    )
  }

  return (
    <Container>
      <DocumentTitle title={meta.name} />
      <Grid gap="4">
        {dailyVolume.length >= 5 && (
          <Card size="2">
            <Grid gap="2">
              <Text color="gray">
                {hovered?.date ? new Date(hovered.date).toLocaleString(undefined, {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '30d Volume'}
              </Text>
              <Text size="7" weight="bold">
                <Money lamports={hovered?.total_volume ?? totalVolume} />
              </Text>
              <Box style={{height: '200px'}}>
                <Graph onHover={setHovered} dailyVolume={dailyVolume} />
              </Box>
            </Grid>
          </Card>
        )}

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                <PlatformText address={address!} />
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
                  <Link target="_blank" href={`https://solscan.io/address/${address}`} rel="noreferrer">
                    {address} <ExternalLinkIcon />
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
                    {uniquePlayers}
                  </Text>
                </Grid>
              </Table.Cell>
            </Table.Row>

          </Table.Body>
        </Table.Root>

        {topPlayers.length > 0 && topPlayersByWager.length > 0 && (
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
                  {topPlayersByWager.slice(0, 6).map((player, i) => (
                    <TableRowNavLink key={i} to={`/player/${player.player}`} style={{flexGrow: '1'}}>
                      <Table.Cell>
                        <Flex gap="2" justify="between">
                          <Text>
                            {truncateString(player.player)}
                          </Text>
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
                  {topPlayers.slice(0, 6).map((player, i) => (
                    <TableRowNavLink key={i} to={`/player/${player.player}`} style={{flexGrow: '1'}}>
                      <Table.Cell>
                        <Flex justify="between" gap="2">
                          <Text>
                            {truncateString(player.player)}
                          </Text>
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
      </Grid>
    </Container>
  )
}
