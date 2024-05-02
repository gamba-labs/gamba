import { ExternalLinkIcon } from "@radix-ui/react-icons"
import { Avatar, Button, Card, Container, Dialog, Flex, Grid, Link, Text } from "@radix-ui/themes"
import React from "react"
import { NavLink, useParams } from "react-router-dom"

import RecentPlays from "@/RecentPlays"
import { PlatformTokenResponse, StatsResponse, useApi } from "@/api"
import { TokenAvatar } from "@/components"
import { truncateString } from "@/components/AccountItem"
import { Details } from "@/components/Details"
import { SkeletonCard, SkeletonFallback } from "@/components/Skeleton"
import { useBonfidaName, usePlatformMeta, useTokenMeta } from "@/hooks"
import { PublicKey } from "@solana/web3.js"
import { minidenticon } from "minidenticons"
import styled from "styled-components"
import { TopPlayers, TotalVolume } from "../Dashboard/Dashboard"
import { ThingCard } from "../Pool/PoolView"

const OnlineIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: #22ff63;
  border-radius: 50%;
  display: inline-block;
  margin-right: .5em;
  vertical-align: middle;

  @keyframes online-indicator-pulsing {
    0%, 25%, 75%, 100% {opacity : 1};
    50% {opacity : .5};
  }

  animation: online-indicator-pulsing infinite 1s;
`

// const Card2 = styled(Card)<{$active: boolean}>`
//   ${(props) => props.$active && css`
//     box-shadow: 0 0 0 1px #ff0066;
//   `}
// `

function LinkWarningDialog(props: {url: string}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Link>
          {props.url.split("https://")[1]}
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
            <Button onClick={() => window.open(props.url, "_blank")} role="link" variant="solid">
              {props.url} <ExternalLinkIcon />
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export function PlatformDetails({ creator }: {creator: string}) {
  const meta = usePlatformMeta(creator)

  return (
    <Details
      title="Details"
      rows={[
        [
          "Creator",
          <Link target="_blank" href={`https://solscan.io/address/${creator}`} rel="noreferrer">
            {creator} <ExternalLinkIcon />
          </Link>
        ],
        meta.url && [
          "URL",
          <LinkWarningDialog url={meta.url} />
        ],
      ]}
    />
  )
}

function TokenVolume({token}: {token: PlatformTokenResponse[number] }) {
  const meta = useTokenMeta(token.token)
  return (
    <Card>
      <Flex align="center" justify="between">
        <Flex align="center" gap="4">
          <TokenAvatar size="1" mint={token.token} />
          <Text>
            {meta.name}
          </Text>
        </Flex>
        <Flex>
          <Text
            color="gray"
            title={`${(token.volume / (10 ** meta.decimals)).toLocaleString()} ${meta.symbol}`}
          >
            {token.num_plays.toLocaleString()} / ${(token.usd_volume).toLocaleString(undefined, {maximumFractionDigits: 3})}
          </Text>
        </Flex>
      </Flex>
    </Card>
  )
}

function PlatformHeader({ creator }: {creator: string}) {
  const meta = usePlatformMeta(creator)
  const domainName = useBonfidaName(creator)
  const image = React.useMemo(() => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(creator.toString())), [creator])

  return (
    <Flex gap="4" align="center">
      <Avatar
        size="2"
        src={meta.image ?? image}
        fallback=""
      />
      {meta.name ?? domainName ?? truncateString(creator)}
    </Flex>
  )
}

export function Things({creator, startTime = 0}: {creator?: string | PublicKey, startTime?: number}) {
  const { data, isLoading } = useApi<StatsResponse>('/stats', {creator: creator?.toString(), startTime})
  return (
    <Flex gap="2" wrap="wrap">
      <ThingCard title="Volume">
        <SkeletonFallback loading={isLoading}>
          ${data?.usd_volume.toLocaleString()}
        </SkeletonFallback>
      </ThingCard>
      <ThingCard title="Estimated Fees">
        <SkeletonFallback loading={isLoading}>
          ${data?.revenue_usd.toLocaleString()}
        </SkeletonFallback>
      </ThingCard>
      <ThingCard title="Plays">
        <SkeletonFallback loading={isLoading}>
          {data?.plays.toLocaleString()}
        </SkeletonFallback>
      </ThingCard>
      <ThingCard title="Players">
        <SkeletonFallback loading={isLoading}>
          {data?.players.toLocaleString()}
        </SkeletonFallback>
      </ThingCard>
      {data && data.active_players > 0 && (
        <ThingCard title="Active players">
          <OnlineIndicator />
          <SkeletonFallback loading={isLoading}>
            {data?.active_players.toLocaleString()}
          </SkeletonFallback>
        </ThingCard>
      )}
    </Flex>
  )
}

export function PlatformView() {
  const { address } = useParams<{address: string}>()
  const { data: tokens = [], isLoading } = useApi<PlatformTokenResponse>("/tokens", {creator: address!.toString()})

  return (
    <Container>
      <Flex direction="column" gap="4">
        <Flex justify={{ sm: "between" }} align={{ sm: "end" }} py="4" direction={{ initial: "column", sm: "row" }} gap="4">
          <PlatformHeader creator={address!} />
        </Flex>

        <Things creator={address} />

        <Grid gap="4" columns={{initial: '1', sm: '2'}}>
          <Flex gap="4" direction="column">
            <TotalVolume creator={address!} />
            <PlatformDetails creator={address!} />
          </Flex>

          <Flex gap="4" direction="column">
            <Card>
              <Flex gap="2" direction="column">
                <Text color="gray">
                  Volume by token
                </Text>
                <Flex direction="column" gap="2">
                  {isLoading && !tokens.length &&
                    Array.from({length: 3})
                      .map((_, i) => <SkeletonCard key={i} />)
                  }
                  {tokens.map((token, i) => (
                    <TokenVolume key={i} token={token} />
                  ))}
                </Flex>
              </Flex>
            </Card>

            <Card>
              <Flex gap="2" direction="column">
                <Flex justify="between">
                  <Text color="gray">
                    7d Leaderboard
                  </Text>
                  <Link asChild>
                    <NavLink to={`/leaderboard?creator=${address?.toString()}`}>
                      View all
                    </NavLink>
                  </Link>
                </Flex>
                <TopPlayers creator={address!} />
              </Flex>
            </Card>
          </Flex>
        </Grid>

        <Text color="gray">
          Recent plays
        </Text>
        <RecentPlays creator={address!} />
      </Flex>

    </Container>
  )
}
