import { ExternalLinkIcon } from "@radix-ui/react-icons"
import { Box, Grid, Link, Table, Text } from "@radix-ui/themes"
import React from "react"
import { useParams } from "react-router-dom"

import { PlayerAccountItem } from "@/components/AccountItem"

export function PlayerView() {
  const { address } = useParams<{address: string}>()

  return (
    <Grid gap="4">
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              <PlayerAccountItem address={address!} />
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <Grid columns="2" gap="4">
                <Text weight="bold">
                  Address
                </Text>
                <Link target="_blank" href={`https://solscan.io/address/${address}`} rel="noreferrer">
                  {address} <ExternalLinkIcon />
                </Link>
              </Grid>
            </Table.Cell>
          </Table.Row>

        </Table.Body>
      </Table.Root>

      <Box>
        <Grid gap="2">
          {/* <Text color="gray">
            Recent plays
          </Text> */}
          {/* <RecentPlays player={address} /> */}
        </Grid>
      </Box>
    </Grid>
  )
}
