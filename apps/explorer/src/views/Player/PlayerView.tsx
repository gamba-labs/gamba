import RecentPlays from "@/RecentPlays"
import { PlayerAccountItem } from "@/components/AccountItem"
import { ExternalLinkIcon } from "@radix-ui/react-icons"
import { Flex, Grid, Link, Table, Text } from "@radix-ui/themes"
import React from "react"
import { useParams } from "react-router-dom"

export function PlayerView() {
  const { address } = useParams<{address: string}>()
  // const { data } = useApi<any>("/player", {user: address!})

  return (
    <Flex direction="column" gap="4">
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
      <Text color="gray">
        Recent Plays
      </Text>
      <RecentPlays user={address!} />
    </Flex>
  )
}
