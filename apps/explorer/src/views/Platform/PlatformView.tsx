import { ExternalLinkIcon } from "@radix-ui/react-icons"
import { Button, Card, Container, Dialog, Flex, Grid, Link, Table, Text } from "@radix-ui/themes"
import React from "react"
import { useParams } from "react-router-dom"

import RecentPlays from "@/RecentPlays"
import { fetchStatus, fetchTokensForPlatform } from "@/api"
import { TokenAvatar } from "@/components"
import { PlatformAccountItem } from "@/components/AccountItem"
import { useTokenMeta } from "@/hooks"
import { getPlatformMeta } from "@/platforms"
import useSWR from "swr"
import { TopPlayers, TotalVolume } from "../Dashboard/Dashboard"

function Details({ creator }: {creator: string}) {
  const {data, isLoading} = useSWR('stats-' + creator.toString(), () => fetchStatus(creator))
  const meta = getPlatformMeta(creator)

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>
            <PlatformAccountItem address={creator} />
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Creator
              </Text>
              <Link target="_blank" href={`https://solscan.io/address/${creator}`} rel="noreferrer">
                {creator} <ExternalLinkIcon />
              </Link>
            </Grid>
          </Table.Cell>
        </Table.Row>

        {meta.url && (
          <Table.Row>
            <Table.Cell>
              <Grid columns="2" gap="4">
                <Text weight="bold">
                  URL
                </Text>
                <Dialog.Root>
                  <Dialog.Trigger>
                    <Link>
                      {meta.url?.split("https://")[1]}
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
                        <Button onClick={() => window.open(meta.url, "_blank")} role="link" variant="solid">
                          {meta.url} <ExternalLinkIcon />
                        </Button>
                      </Dialog.Close>
                    </Flex>
                  </Dialog.Content>
                </Dialog.Root>
              </Grid>
            </Table.Cell>
          </Table.Row>
        )}

        <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Volume
              </Text>
              <Text>
                ${data?.usd_volume.toLocaleString(undefined)}
              </Text>
            </Grid>
          </Table.Cell>
        </Table.Row>

        {/* <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Estimated revenue
              </Text>
              <Text>
                ${(data?.revenue_usd ?? 0).toLocaleString(undefined)}
              </Text>
            </Grid>
          </Table.Cell>
        </Table.Row> */}

        <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Plays
              </Text>
              <Text>
                {data?.plays.toLocaleString(undefined)}
              </Text>
            </Grid>
          </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            <Grid columns="2" gap="4">
              <Text weight="bold">
                Players
              </Text>
              <Text>
                {data?.players.toLocaleString(undefined)}
              </Text>
            </Grid>
          </Table.Cell>
        </Table.Row>

      </Table.Body>
    </Table.Root>

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
            {/* ${(token.usd_volume / token.numPlays).toLocaleString(undefined, {maximumFractionDigits: 3})} - {token.numPlays} */}
          </Text>
        </Flex>
      </Flex>
    </Card>
  )
}

export function PlatformView() {
  const { address } = useParams<{address: string}>()
  const { data: tokens = [] } = useSWR("platform-tokens-" + address!.toString(), () => fetchTokensForPlatform(address!))

  return (
    <Container>
      <Flex direction="column" gap="4">
        <Grid gap="4" columns={{initial: '1', sm: '2'}}>
          <Flex gap="4" direction="column">
            <Details creator={address!} />
            <TopPlayers creator={address!} />
          </Flex>

          <Flex gap="4" direction="column">
            <TotalVolume creator={address!} />
            <Card>
              <Text color="gray">
                Volume by token
              </Text>
              <Flex direction="column" gap="2">
                {tokens.map((token, i) => (
                  <TokenVolume key={i} token={token} />
                ))}
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
