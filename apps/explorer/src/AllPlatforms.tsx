import { Box, Container, Flex, Grid, Table, Text } from '@radix-ui/themes'
import React from 'react'
import { Money } from './Money'
import { useApi } from './api'
import { PlatformAccountItem } from './components/AccountItem'
import { Loader } from './components/Loader'
import { TableRowNavLink } from './components/TableRowLink'

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
  const { data, isLoading, error } = useApi('/stats/creators')

  const sorted = React.useMemo(
    () => data?.creators.sort((a, b) => b.volume - a.volume),
    [data?.creators]
  )

  if (isLoading) {
    return (
      <Container>
        <Flex align="center" justify="center" p="4">
          <Loader />
        </Flex>
      </Container>
    )
  }

  if (error || !sorted) {
    return (
      <Container>
        Failed to fetch all platforms
      </Container>
    )
  }

  return (
    <Container>
      <Grid gap="4">
        <Box>
          <Text color="gray">All Platforms</Text>
        </Box>
        <CreatorList creators={sorted} />
      </Grid>
    </Container>
  )
}
