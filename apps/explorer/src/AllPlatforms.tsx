import { Box, Card, Container, Flex, Grid, Table, Text } from '@radix-ui/themes'
import React from 'react'
import { Graph } from './Graph'
import { Money } from './Money'
import { getCreators, getDailyVolume } from './api'
import { Loader } from './components/Loader'
import { PlatformAccountItem } from './components/AccountItem'
import { TableRowNavLink } from './components/TableRowLink'
import { DailyVolume } from './data'

export function VolumeGraph({ creator }: {creator?: string}) {
  const [dailyVolume, setDailyVolume] = React.useState<DailyVolume[]>([])
  const [hovered, setHovered] = React.useState<DailyVolume | null>(null)

  React.useEffect(() => {
    getDailyVolume(creator).then(setDailyVolume).catch(console.error)
  }, [])

  const totalVolume = React.useMemo(() => {
    return dailyVolume.reduce((prev, creator) => prev + creator.total_volume, 0)
  }, [dailyVolume])

  return (
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
  )
}

function useDashboard() {
  const [loading, setLoading] = React.useState(true)
  const [creators, setCreators] = React.useState<{creator: string, volume: number}[]>([])

  React.useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        setCreators(await getCreators())
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return {loading, creators}
}

function CreatorList({creators}: {creators: {creator: string, volume: number}[]}) {
  return (
    <Table.Root className="CreatorsTable" variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>
            #
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            Platform
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell align="right">
            Volume
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {creators.map((creator, i) => {
          const { creator: address, volume } = creator
          const index = creators.indexOf(creator)
          return (
            <TableRowNavLink key={i} to={'/platform/' + address}>
            <Table.Cell>
              <Text>
                {index + 1}
              </Text>
            </Table.Cell>
              <Table.Cell>
                <PlatformAccountItem address={address} />
              </Table.Cell>
              <Table.Cell align="right">
                <Text>
                  <Money lamports={volume} />
                </Text>
              </Table.Cell>
            </TableRowNavLink>
          )
        })}
      </Table.Body>
    </Table.Root>
  )
}

export function AllPlatforms() {
  const {loading, creators} = useDashboard()

  if (loading) {
    return (
      <Container>
        <Flex align="center" justify="center" p="4">
          <Loader />
        </Flex>
      </Container>
    )
  }

  return (
    <Container>
      <Grid gap="4">
        <Box>
          <Text color="gray">All Platforms</Text>
        </Box>
        <CreatorList creators={creators} />
      </Grid>
    </Container>
  )
}
