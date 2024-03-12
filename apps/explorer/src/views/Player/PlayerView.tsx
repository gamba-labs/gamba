import RecentPlays from "@/RecentPlays"
import { PlayerResponse, useApi } from "@/api"
import { PlayerAccountItem } from "@/components/AccountItem"
import { Details } from "@/components/Details"
import { SolanaAddress } from "@/components/SolanaAddress"
import { Flex, Table, Text } from "@radix-ui/themes"
import React from "react"
import { useParams } from "react-router-dom"

export function PlayerView() {
  const { address } = useParams<{address: string}>()
  const { data } = useApi<PlayerResponse>("/player", {user: address!})

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

        <Details
          title="Details"
          rows={[
            ["Address", <SolanaAddress address={address!} />],
            [
              "Volume",
              <Text>
                ${(data?.usd_volume ?? 0).toLocaleString()}
              </Text>
            ],
            [
              "Profit",
              <Text>
                ${(data?.usd_profit ?? 0).toLocaleString()}
              </Text>
            ],
            [
              "Games played",
              <Text>
                {data?.games_played ?? 0}
              </Text>
            ],
            [
              "Games won",
              <Text>
                {data?.games_won ?? 0}
              </Text>
            ],
          ]}
        />
      </Table.Root>
      <Text color="gray">
        Recent Plays
      </Text>
      <RecentPlays user={address!} />
    </Flex>
  )
}
