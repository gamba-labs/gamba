import { ClipboardIcon, InfoCircledIcon, TriangleUpIcon } from '@radix-ui/react-icons'
import { Badge, Box, Button, Callout, Card, Container, Flex, Grid, Heading, Link, Table, Text } from '@radix-ui/themes'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { AreaGraph } from './AreaGraph'
import { CREATORS, PLAYS } from './data'

export function Dashboard() {
  return (
    <Container>
      <Container mb="4">
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Data displayed on the dashboard are samples.
          </Callout.Text>
        </Callout.Root>
      </Container>
      <div style={{ height: '250px' }}>
        <AreaGraph />
      </div>
      <Box my="4">
        <Grid
          columns={{ initial: '2', sm: '4' }}
          gap="4"
        >
          <Box>
            <Card size="3">
              <Heading color="orange" size="5">
                Volume
              </Heading>
              <Text size="8" weight="bold">
                -
              </Text>
            </Card>
          </Box>
          <Box>
            <Card size="3">
              <Heading color="orange" size="5">
                Plays
              </Heading>
              <Text size="8" weight="bold">
                -
              </Text>
            </Card>
          </Box>
          <Box>
            <Card size="3">
              <Heading color="orange" size="5">
                Players
              </Heading>
              <Text size="8" weight="bold">
                -
              </Text>
            </Card>
          </Box>
          <Box grow="1">
            <Card size="3">
              <Heading color="orange" size="5">
                Creators
              </Heading>
              <Text size="8" weight="bold">
                -
              </Text>
            </Card>
          </Box>
        </Grid>
      </Box>

      <Grid
        columns={{ sm: '2' }}
        gap="4"
      >
        <Box>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>
                  Creator
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="right">
                  Volume
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>

              {CREATORS.map(({ address, meta, volume }, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Flex align="baseline" gap="2">
                      <Button variant="ghost" size="1">
                        <ClipboardIcon />
                      </Button>
                      <Link asChild>
                        <NavLink to={'/address/' + address}>
                          {meta?.name ?? (address.substring(0, 24) + '...')}
                        </NavLink>
                      </Link>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Text>
                      {volume} SOL
                    </Text>
                    {/* <Badge color="green">
                      <TriangleUpIcon />
                    </Badge> */}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

        <Box>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>
                  Play
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell align="right">
                  Payout
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {[...PLAYS].sort((a, b) => b.multiplier - a.multiplier).slice(0, 4).map(({ txid, profit, multiplier }, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Flex align="baseline" gap="2">
                      <Button variant="ghost" size="1">
                        <ClipboardIcon />
                      </Button>

                      <Link asChild>
                        <NavLink to={'/tx/' + txid}>
                          {txid.substring(0, 6)}
                        </NavLink>
                      </Link>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Text mr="2">
                      {Math.abs(profit).toFixed(3)} SOL
                    </Text>
                    <Badge color={profit >= 0 ? 'green' : 'red'}>
                      {multiplier >= 1 ? '+' : '-'}
                      {Math.abs(multiplier * 100 - 100).toFixed(0)}%
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Grid>

      <Box my="4">
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                Play
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">
                Payout
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {PLAYS.map(({ txid, profit, multiplier }, i) => (
              <Table.Row key={i}>
                <Table.Cell>
                  <Flex align="baseline" gap="2">
                    <Button variant="ghost" size="1">
                      <ClipboardIcon />
                    </Button>
                    {/* <Tooltip content={txid}> */}
                    <Link asChild>
                      <NavLink to={'/tx/' + txid}>
                        {txid.substring(0, 20)}...
                      </NavLink>
                    </Link>
                    {/* </Tooltip> */}
                  </Flex>
                </Table.Cell>
                <Table.Cell align="right">
                  <Text mr="2">
                    {Math.abs(profit).toFixed(3)} SOL
                  </Text>
                  <Badge color={profit >= 0 ? 'green' : 'red'}>
                    {multiplier >= 1 ? '+' : '-'}
                    {Math.abs(multiplier * 100 - 100).toFixed(0)}%
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Container>
  )
}
