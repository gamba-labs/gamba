import RecentPlays from "@/RecentPlays"
import { PlayerResponse, useApi } from "@/api"
import { PlayerAccountItem } from "@/components/AccountItem"
import { Details } from "@/components/Details"
import { SkeletonFallback } from "@/components/Skeleton"
import { SolanaAddress } from "@/components/SolanaAddress"
import { Flex, Text } from "@radix-ui/themes"
import React from "react"
import { useParams } from "react-router-dom"
import { ThingCard } from "../Pool/PoolView"

function PlayerStats() {
  const { address } = useParams<{address: string}>()
  const { data, isLoading } = useApi<PlayerResponse>("/player", {user: address!})
  return (
    <Flex gap="2" wrap="wrap">
      <ThingCard title="Volume">
        <SkeletonFallback loading={isLoading}>
          ${(data?.usd_volume ?? 0).toLocaleString()}
        </SkeletonFallback>
      </ThingCard>
      <ThingCard title="Estimated Fees">
        <SkeletonFallback loading={isLoading}>
          ${(data?.usd_profit ?? 0).toLocaleString()}
        </SkeletonFallback>
      </ThingCard>
      <ThingCard title="Plays">
        <SkeletonFallback loading={isLoading}>
          {data?.games_played ?? 0}
        </SkeletonFallback>
      </ThingCard>
      <ThingCard title="Wins">
        <SkeletonFallback loading={isLoading}>
          {data?.games_won ?? 0}
        </SkeletonFallback>
      </ThingCard>
    </Flex>
  )
}

export function PlayerView() {
  const { address } = useParams<{address: string}>()
  const { data } = useApi<PlayerResponse>("/player", {user: address!})

  return (
    <Flex direction="column" gap="4">
      <PlayerStats />
      <Details
        title={
          <PlayerAccountItem address={address!} />
        }
        rows={[
          ["Address", <SolanaAddress address={address!} />],
        ]}
      />
      <Text color="gray">
        Recent Plays
      </Text>
      <RecentPlays user={address!} />
    </Flex>
  )
}
