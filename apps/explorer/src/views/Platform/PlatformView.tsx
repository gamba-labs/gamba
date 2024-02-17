import { ArrowRightIcon, ExternalLinkIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import { Avatar, Button, Card, Container, Dialog, Flex, Grid, Heading, IconButton, Link, Table, Text } from "@radix-ui/themes"
import React from "react"
import { NavLink, useNavigate, useParams } from "react-router-dom"

import RecentPlays from "@/RecentPlays"
import { fetchStatus, fetchTokensForPlatform } from "@/api"
import { TokenAvatar } from "@/components"
import { PlatformAccountItem, truncateString } from "@/components/AccountItem"
import { useBonfidaName, useTokenMeta } from "@/hooks"
import { getPlatformMeta } from "@/platforms"
import useSWR from "swr"
import { TopPlayers, TotalVolume } from "../Dashboard/Dashboard"
import { Details } from "@/components/Details"
import { useAccount, useWalletAddress } from "gamba-react-v2"
import { decodeGambaState, getGambaStateAddress } from "gamba-core-v2"
import { SolanaAddress } from "@/components/SolanaAddress"
import { minidenticon } from "minidenticons"
import { ThingCard } from "../Pool/PoolView"
import styled from "styled-components"

const OnlineIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: #22ff63;
  border-radius: 50%;
  display: inline-block;
  margin-right: .5em;
  vertical-align: middle;

  @keyframes dsa {
    0%, 25%, 75%, 100% {opacity : 1};
    50% {opacity : .5};
  }

  animation: dsa infinite 1s;
`

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
  const { data, isLoading } = useSWR('stats-' + creator?.toString(), () => fetchStatus(creator))
  const meta = getPlatformMeta(creator)

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

function TokenVolume({token}: {token: Awaited<ReturnType<typeof fetchTokensForPlatform>>[number] }) {
  const meta = useTokenMeta(token.mint)
  return (
    <Card>
      <Flex align="center" justify="between">
        <Flex align="center" gap="4">
          <TokenAvatar size="1" mint={token.mint} />
          <Text>
            {meta.name}
          </Text>
        </Flex>
        <Flex>
          <Text color="gray">
            {token.numPlays.toLocaleString()} / ${(token.usd_volume).toLocaleString(undefined, {maximumFractionDigits: 3})}
          </Text>
        </Flex>
      </Flex>
    </Card>
  )
}

function PlatformHeader({ creator }: {creator: string}) {
  const meta = getPlatformMeta(creator)
  const domainName = useBonfidaName(creator)
  const image = React.useMemo(() => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(creator.toString())), [creator])

  return (
    <Flex gap="4" align="start">
      <Avatar
        size="3"
        src={meta.image ?? image}
        fallback=""
      />

      <Flex direction="column" gap="2">
        <Heading>
          {meta.name ?? domainName ?? truncateString(creator)}
        </Heading>
      </Flex>
    </Flex>
  )
}

function Things() {
  const { address } = useParams<{address: string}>()
  const { data, isLoading } = useSWR('stats-' + address?.toString(), () => fetchStatus(address))
  return (
    <Flex gap="2" wrap="wrap">
      <ThingCard title="Volume">
        <Text>${data?.usd_volume.toLocaleString()}</Text>
      </ThingCard>
      <ThingCard title="Estimated Fees">
        <Text>${data?.revenue_usd.toLocaleString()}</Text>
      </ThingCard>
      <ThingCard title="Plays">
        <Text>{data?.plays.toLocaleString()}</Text>
      </ThingCard>
      <ThingCard title="Players">
        <Text>{data?.players.toLocaleString()}</Text>
      </ThingCard>
      {data && data.active_players > 0 && (
        <ThingCard title="Active players">
          <OnlineIndicator />
          <Text>{data?.active_players.toLocaleString()}</Text>
        </ThingCard>
      )}
    </Flex>

  )
}

export function PlatformView() {
  const { address } = useParams<{address: string}>()
  const { data: tokens = [] } = useSWR("platform-tokens-" + address!.toString(), () => fetchTokensForPlatform(address!))

  return (
    <Container>
      <Flex direction="column" gap="4">
        <Flex justify={{ sm: "between" }} align={{ sm: "end" }} py="4" direction={{ initial: "column", sm: "row" }} gap="4">
          <PlatformHeader creator={address!} />
        </Flex>

        <Things />

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
                  {tokens.map((token, i) => (
                    <TokenVolume key={i} token={token} />
                  ))}
                </Flex>
              </Flex>
            </Card>
            <TopPlayers creator={address!} />
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
