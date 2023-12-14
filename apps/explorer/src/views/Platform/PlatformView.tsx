import { ExternalLinkIcon } from "@radix-ui/react-icons"
import { Button, Container, Dialog, Flex, Grid, Link, Table, Text } from "@radix-ui/themes"
import React from "react"
import { useParams } from "react-router-dom"

import { PlatformAccountItem } from "@/components/AccountItem"
import { getPlatformMeta } from "@/platforms"

function Details({ creator }: {creator: string}) {
  const meta = getPlatformMeta(creator)
  const { data: uniquePlayerData } = { data: [] }

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
                Fee collector
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
                Players
              </Text>
              <Text>
                {/* {uniquePlayerData?.unique_players} */}
              </Text>
            </Grid>
          </Table.Cell>
        </Table.Row>

      </Table.Body>
    </Table.Root>

  )
}

export function PlatformView() {
  const { address } = useParams<{address: string}>()
  const creator = address!
  const meta = getPlatformMeta(creator)

  return (
    <Container>
      {/* <Button color="green" onClick={() => setIFrame(true)}>Play now</Button> */}
      <Flex direction="column" gap="4">
        {/* <VolumeGraph creator={address} /> */}
        <Details creator={address!} />
        {/* <Box>
          <Grid gap="2">
            <Text color="gray">
              Recent plays
            </Text>
          </Grid>
        </Box> */}
      </Flex>
    </Container>
  )
}
