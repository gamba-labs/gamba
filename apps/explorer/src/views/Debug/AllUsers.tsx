import { Badge, Card, Flex, Grid, Heading } from "@radix-ui/themes"
import { useGambaProgram } from "gamba-react-v2"
import React from "react"
import useSWR from "swr"

import { SolanaAddress } from "@/components/SolanaAddress"
import { Spinner } from "@/components/Spinner"
import { useTokenList } from "@/hooks"

const getEnumString = (e: any) => Object.keys(e)[0]

export default function AllUsers() {
  const program = useGambaProgram()
  const { data: games = [], isLoading: isLoadingPools } = useSWR("all-games", () => program.account.game.all())
  const tokens = useTokenList()

  const statusOrder: (keyof typeof games[number]["account"]["status"])[] = [
    "resultRequested",
    "notInitialized",
    "none",
    "ready",
  ]

  const sorted = React.useMemo(
    () => {
      return games.sort((a, b) => {
        const so = statusOrder.indexOf(getEnumString(a.account.status) as any) - statusOrder.indexOf(getEnumString(b.account.status) as any)
        if (so) return so
        return a.publicKey.toString() > b.publicKey.toString() ? 1 : -1
      })
    },
    [tokens],
  )

  return (
    <Card size="3">
      <Grid gap="4">
        <Heading>Users</Heading>
        {isLoadingPools && (
          <Flex align="center" justify="center" p="4">
            <Spinner />
          </Flex>
        )}
        <Grid gap="2">
          {sorted.map(game => (
            <Card size="1" key={game.publicKey.toBase58()}>
              <Flex gap="2">
                <SolanaAddress address={game.account.user} />
                <Badge>
                  {getEnumString(game.account.status)}
                </Badge>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Card>
  )
}
