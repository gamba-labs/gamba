import { Button, Card, Flex, Grid, Heading, Link } from "@radix-ui/themes"
import { useGambaProgram } from "gamba-react-v2"
import React from "react"
import useSWR from "swr"

import { PlatformAccountItem, PlayerAccountItem } from "@/components/AccountItem"
import { Spinner } from "@/components/Spinner"
import { TokenValue2 } from "@/components/TokenValue2"
import { useTokenList } from "@/hooks"
import { NavLink } from "react-router-dom"

const getEnumString = (e: any) => Object.keys(e)[0]

export default function AllUsers() {
  const program = useGambaProgram()
  const { data: games = [], isLoading, isValidating, mutate } = useSWR("all-games", () => program.account.game.all())
  const tokens = useTokenList()
  const [page, setPage] = React.useState(0)

  const statusOrder: (keyof typeof games[number]["account"]["status"])[] = [
    "resultRequested",
    "notInitialized",
    "none",
    "ready",
  ]

  const sorted = React.useMemo(
    () => {
      return games
        .sort((a, b) => {
          const so = statusOrder.indexOf(getEnumString(a.account.status) as any) - statusOrder.indexOf(getEnumString(b.account.status) as any)
          if (so) return so
          return a.publicKey.toString() > b.publicKey.toString() ? 1 : -1
        })
    },
    [games, tokens],
  )

  const pages = Array.from({length: Math.ceil(sorted.length / 25)}).map((_, i) => i)

  const sliced = React.useMemo(
    () => sorted.slice(page * 25, page * 25 + 25),
    [sorted, page]
  )

  return (
    <Card size="3">
      <Grid gap="4">
        <Flex justify="between">
          <Heading>Active game accounts</Heading>
          <Button variant="soft" disabled={isLoading || isValidating} onClick={() => mutate()}>
            Refresh
          </Button>
        </Flex>
        {isLoading || isValidating && (
          <Flex align="center" justify="center" p="4">
            <Spinner />
          </Flex>
        )}
        <Grid gap="2">
          {sliced.map((game, index) => (
            <Card size="1" key={game.publicKey.toBase58()}>
              <Flex gap="2">
                <NavLink to={"/player/" + game.account.user.toString()}>
                  <PlayerAccountItem address={game.account.user} />
                </NavLink>
                {' wagered '}
                <TokenValue2 mint={game.account.tokenMint} amount={game.account.wager} />
                {' on '}
                <NavLink to={"/platform/" + game.account.creator.toString()}>
                  <PlatformAccountItem address={game.account.creator} />
                </NavLink>
                {game.account.status.resultRequested && '⏳'}
              </Flex>
            </Card>
          ))}
        </Grid>
        <Flex wrap="wrap" gap="2">
          {pages.map((x) => <Button size="1" variant="soft" key={x} onClick={() => setPage(x)}>{x + 1}</Button>)}
        </Flex>
      </Grid>
    </Card>
  )
}
