import RecentPlays from "@/RecentPlays"
import { PlayerResponse, useApi } from "@/api"
import { DetailCard } from "@/components"
import { PlayerAccountItem } from "@/components/AccountItem"
import { Details } from "@/components/Details"
import { SkeletonFallback } from "@/components/Skeleton"
import { SolanaAddress } from "@/components/SolanaAddress"
import { Flex, Text } from "@radix-ui/themes"
import React from "react"
import { useParams } from "react-router-dom"

function PlayerStats() {
  const { address } = useParams<{address: string}>()
  const { data, isLoading } = useApi<PlayerResponse>("/player", {user: address!})
  return (
    <Flex gap="2" wrap="wrap">
      <DetailCard title="Volume">
        <SkeletonFallback loading={isLoading}>
          ${(data?.usd_volume ?? 0).toLocaleString()}
        </SkeletonFallback>
      </DetailCard>
      <DetailCard title="Profit">
        <SkeletonFallback loading={isLoading}>
          ${(data?.usd_profit ?? 0).toLocaleString()}
        </SkeletonFallback>
      </DetailCard>
      <DetailCard title="Plays">
        <SkeletonFallback loading={isLoading}>
          {data?.games_played ?? 0}
        </SkeletonFallback>
      </DetailCard>
      <DetailCard title="Wins">
        <SkeletonFallback loading={isLoading}>
          {data?.games_won ?? 0}
        </SkeletonFallback>
      </DetailCard>
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
