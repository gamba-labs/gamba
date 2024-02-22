import { TopCreatorsData, useApi } from "@/api"
import { PlatformAccountItem } from "@/components/AccountItem"
import { getPlatformMeta } from "@/platforms"
import { Card, Flex, Text } from "@radix-ui/themes"
import React from "react"
import { NavLink } from "react-router-dom"
import styled from "styled-components"

export const UnstyledNavLink = styled(NavLink)`
  text-decoration: none;
  cursor: pointer;
  color: unset;
`

const SkeletonCard = styled(Card)`
  overflow: hidden;
  background-color: #DDDBDD;
  border-radius: var(--radius-4);
  height: 59px;
  animation: skeleton-shine 1s linear infinite;

  @keyframes skeleton-shine {
    0%, 100% {
      background-color: #DDDBDD33;
    }
    50% {
      background-color: #DDDBDD22;
    }
  }
`

function PlatformTableRow({ platform, rank }: { platform: TopCreatorsData, rank: number }) {
  const meta = getPlatformMeta(platform.creator)

  return (
    <UnstyledNavLink key={platform.creator} to={`/platform/${platform.creator}`}>
      <Card size="2">
        <Flex align="center" gap="4">
          <Text color="gray" style={{opacity: .5}}>
            {rank}
          </Text>
          <Flex justify="between" grow="1">
            <PlatformAccountItem avatarSize="1" address={meta.address} />
            <Text>
              ${platform.usd_volume.toLocaleString(undefined, {maximumFractionDigits: 2})}
            </Text>
          </Flex>
        </Flex>
      </Card>
    </UnstyledNavLink>
  )
}

export function TopPlatforms({limit = 10, days = 7}: {limit?: number, days?: number}) {
  const { data: platforms = [], isLoading } = useApi<TopCreatorsData[]>(
    "/platforms",
    {
      limit,
      sortBy: 'volume',
      days
    }
  )

  return (
  <Flex gap="2" direction="column">
    {isLoading ? (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </>
    ) : (
      <>
        {platforms.map((platform, i) => (
          <PlatformTableRow
            key={platform.creator}
            platform={platform}
            rank={i + 1}
          />
        ))}
      </>
    )}
  </Flex>
  )
}
