import { ExternalLinkIcon, GearIcon, InfoCircledIcon, PlusIcon, RocketIcon } from "@radix-ui/react-icons"
import { Badge, Box, Button, Card, Dialog, Flex, Grid, Heading, IconButton, Link, Switch, Tabs, Text } from "@radix-ui/themes"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { BPS_PER_WHOLE, NATIVE_MINT, decodeGambaState, getGambaStateAddress, getPoolBonusAddress, getPoolLpAddress } from "gamba-core-v2"
import { useAccount, useGambaProgram, usePool, useWalletAddress } from "gamba-react-v2"
import React, { ReactNode } from "react"
import { NavLink, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import useSWR from "swr"

import RecentPlays, { TimeDiff } from "@/RecentPlays"
import { PoolChangesResponse, apiFetcher, getApiUrl } from "@/api"
import { SolanaAddress } from "@/components/SolanaAddress"
import { Spinner } from "@/components/Spinner"
import { useBalance } from "@/hooks"
import { UiPool, fetchPool } from "@/views/Dashboard/PoolList"

import { TokenAvatar } from "@/components"
import { SkeletonCard } from "@/components/Skeleton"
import { TokenValue2 } from "@/components/TokenValue2"
import { useTokenMeta } from "@/hooks/useTokenMeta"
import useSWRInfinite from "swr/infinite"
import { ConnectUserCard } from "../Debug/DebugUser"
import { PoolJackpotDeposit } from "./PoolJackpotDeposit"
import { PoolMintBonus } from "./PoolMintBonus"
import { PoolWithdraw } from "./PoolWithdraw"
import { PoolCharts } from "./PoolCharts"

export function ThingCard(props: { title: string, children: ReactNode }) {
  return (
    <Card>
      <Flex direction="column">
        <Text size="2" color="gray">
          {props.title}
        </Text>
        <Text weight="bold">
          {props.children}
        </Text>
      </Flex>
    </Card>
  )
}

const ResponsiveButtonContainer = styled(Flex)`
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

export function PoolHeader({ pool }: {pool: UiPool}) {
  const token = useTokenMeta(pool.underlyingTokenMint)
  const gambaState = useAccount(getGambaStateAddress(), decodeGambaState)
  const userPublicKey = useWalletAddress()
  const navigate = useNavigate()
  const isPoolAuthority = pool?.state?.poolAuthority?.equals(userPublicKey)
  const isGambaStateAuthority = gambaState?.authority?.equals(userPublicKey)

  return (
    <Flex gap="4" align="center">
      <NavLink to={"/pool/" + pool.publicKey.toBase58()} style={{ display: "contents", color: "unset" }}>
        <TokenAvatar
          size="3"
          mint={pool.underlyingTokenMint}
        />
        <Flex align="center" gap="2">
          <Heading>
            {token.name}
          </Heading>
          <Text color="gray" size="4">
            {token.symbol}
          </Text>
        </Flex>
      </NavLink>

      {(isPoolAuthority || isGambaStateAuthority) && (
        <IconButton size="2" variant="ghost" onClick={() => navigate("/pool/" + pool.publicKey.toBase58() + "/configure")}>
          <GearIcon />
        </IconButton>
      )}
      <Dialog.Root>
        <Dialog.Trigger>
          <IconButton size="2" variant="ghost">
            <InfoCircledIcon />
          </IconButton>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Pool Details</Dialog.Title>
          <Dialog.Description>
            <Flex direction="column">
              <Text color="gray" size="2">Token mint</Text>
              <SolanaAddress address={pool.state.underlyingTokenMint} />
            </Flex>
            <Flex direction="column">
              <Text color="gray" size="2">LP Token mint</Text>
              <SolanaAddress address={getPoolLpAddress(pool.publicKey)} />
            </Flex>
            <Flex direction="column">
              <Text color="gray" size="2">Bonus Token mint</Text>
              <SolanaAddress address={getPoolBonusAddress(pool.publicKey)} />
            </Flex>
            <Flex direction="column">
              <Text color="gray" size="2">Pool Address</Text>
              <SolanaAddress address={pool.publicKey} />
            </Flex>
            <Flex direction="column">
              <Text color="gray" size="2">Pool Authority</Text>
              <SolanaAddress address={pool.state.poolAuthority} />
            </Flex>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  )
}

function LinkWarningDialog(props: React.PropsWithChildren<{url: string}>) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        {props.children}
      </Dialog.Trigger>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>
          Do your own research.
        </Dialog.Title>
        <Dialog.Description size="2">
          Even though the token is listed here, there is no garantuee that it's trustworthy.
        </Dialog.Description>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={() => window.open(props.url, "_blank")} role="link" variant="solid">
              Buy <ExternalLinkIcon />
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

function PoolPlays({ pool }: {pool: UiPool}) {
  const [onlyJackpots, setOnlyJackpots] = React.useState(false)
  return (
    <>
      <Flex mb="4">
        <label>
          <Text mr="4" color="gray" size="2">
            Show Jackpots
          </Text>
          <Switch
            checked={onlyJackpots}
            onCheckedChange={setOnlyJackpots}
            size="1"
            radius="full"
          />
        </label>
      </Flex>
      <RecentPlays pool={pool.publicKey} onlyJackpots={onlyJackpots} />
    </>
  )
}

export function PoolDeposits({pool}: {pool: UiPool}) {
  const { data: poolChanges = [], isLoading } = useSWRInfinite(
    (index, previousData) => {
      return getApiUrl("/events/poolChanges", { pool: pool.publicKey.toString() })
    },
    async (endpoint) => {
      return await apiFetcher<PoolChangesResponse>(endpoint)
    }
  )

  return (
    <Card>
      <Grid gap="2">
        {isLoading && <SkeletonCard size="1" />}
        {poolChanges
          .flatMap(
            ({results}) =>
              results.map(
                (change, i) => {
                  return (
                    <Card key={i} size="1">
                      <Flex justify="between" align="center">
                        <Flex gap="2" align="center">
                          <SolanaAddress truncate address={change.user} />
                          <Badge color={change.action === "deposit" ? "green" : "red"}>
                            {change.action === "deposit" ? "+" : "-"}
                            <TokenValue2 exact mint={pool.underlyingTokenMint} amount={change.amount} />
                          </Badge>
                        </Flex>
                        <Link target="_blank" href={"https://solscan.io/tx/" + change.signature}>
                          <TimeDiff time={change.time} />
                        </Link>
                      </Flex>
                    </Card>
                  )
                },
              )
          )}
      </Grid>
    </Card>
  )
}

function PoolManager({ pool }: {pool: UiPool}) {
  const wallet = useWallet()
  const navigate = useNavigate()
  const token = useTokenMeta(pool.underlyingTokenMint)
  const balances = useBalance(pool.underlyingTokenMint, pool.poolAuthority)
  const _pool = usePool(pool.underlyingTokenMint, pool.poolAuthority)


  const gambaState = useAccount(getGambaStateAddress(), decodeGambaState)

  const jackpotPayoutPercentage = gambaState && gambaState.jackpotPayoutToUserBps ? gambaState.jackpotPayoutToUserBps.toNumber() / BPS_PER_WHOLE : 0


  return (
    <Flex direction="column" gap="4">
      <Flex
        justify={{ sm: "between" }}
        align={{ sm: "end" }}
        py="4"
        direction={{ initial: "column", sm: "row" }}
        gap="4"
      >
        <Flex direction="column" gap="4">
          <PoolHeader pool={pool} />
        </Flex>
        <Flex align="center" gap="4">
          <Flex align="center" gap="4">
            <Dialog.Root>
              <Dialog.Trigger>
                <Button size="1" variant="ghost">
                  Bonus <PlusIcon />
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <PoolMintBonus pool={pool} />
              </Dialog.Content>
            </Dialog.Root>
            <Dialog.Root>
              <Dialog.Trigger>
                <Button size="1" variant="ghost">
                  Jackpot <PlusIcon />
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <PoolJackpotDeposit pool={pool} />
              </Dialog.Content>
            </Dialog.Root>
          </Flex>
          <Flex align="center" gap="4">
            {!token.mint.equals(NATIVE_MINT) && (
              <LinkWarningDialog
                url={`https://jup.ag/swap/SOL-${token.mint.toBase58()}`}>
                  <Button variant="soft" size="3">
                  Buy {token.symbol}
                </Button>
              </LinkWarningDialog>
            )}
            <Button onClick={() => navigate("/pool/" + pool.publicKey.toBase58() + "/deposit")} size="3">
              Add Liquidity <RocketIcon />
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Grid gap="2" columns="1">
        <Flex gap="2" wrap="wrap">
          <ThingCard title="LP price">
            {pool.ratio.toLocaleString(undefined, { maximumFractionDigits: 3 })} {token.symbol}
          </ThingCard>
          <ThingCard title="Liquidity">
            <TokenValue2 mint={pool.underlyingTokenMint} amount={pool.liquidity} />
          </ThingCard>
          <ThingCard title="LP Token Supply">
            <TokenValue2 mint={pool.underlyingTokenMint} amount={pool.lpSupply} />
          </ThingCard>
          <ThingCard title="Max Payout">
            <TokenValue2 mint={pool.underlyingTokenMint} amount={_pool.maxPayout} />
          </ThingCard>
          <ThingCard title="Circulating Bonus">
            <TokenValue2 mint={pool.underlyingTokenMint} amount={pool.bonusBalance} />
          </ThingCard>
          <ThingCard title="Jackpot">
            <TokenValue2 exact mint={pool.underlyingTokenMint} amount={Number(pool.jackpotBalance) * jackpotPayoutPercentage} />
          </ThingCard>
          <ThingCard title="Total Plays">
            {pool.plays.toLocaleString(undefined)}
          </ThingCard>
        </Flex>
      </Grid>
      <PoolCharts pool={pool} />
      {balances.lpBalance > 0 ? (
        <Card size="3">
          <Grid gap="2">
            <Text color="gray">
              Your position
            </Text>
            <Text size="5" weight="bold">
              <TokenValue2 dollar mint={pool.underlyingTokenMint} amount={balances.lpBalance * pool.ratio} />
            </Text>
            <Text>
              <TokenValue2 exact mint={pool.underlyingTokenMint} amount={balances.lpBalance} suffix="LP" />
            </Text>
            <PoolWithdraw pool={pool} />
          </Grid>
        </Card>
      ) : wallet.connected ? (
        <Card size="3">
          <Grid gap="4" align="center" justify="center">
            <Heading align="center">
              No position
            </Heading>
            <Text align="center" color="gray">
              You can stake your {token?.symbol} in this pool.
            </Text>
            <Flex align="center" justify="center">
              <Button onClick={() => navigate("/pool/" + pool.publicKey.toBase58() + "/deposit")} size="3">
                Deposit <RocketIcon />
              </Button>
            </Flex>
          </Grid>
        </Card>
      ) : (
        <ConnectUserCard />
      )}

      <Tabs.Root defaultValue="plays">
        <Tabs.List>
          <Tabs.Trigger value="plays">Recent plays</Tabs.Trigger>
          <Tabs.Trigger value="deposits">Deposits</Tabs.Trigger>
        </Tabs.List>
        <Box pt="4">
          <Tabs.Content value="plays">
            <PoolPlays pool={pool} />
          </Tabs.Content>
          <Tabs.Content value="deposits">
            <PoolDeposits pool={pool} />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Flex>
  )
}

export default function PoolView() {
  const program = useGambaProgram()
  const params = useParams<{poolId: string}>()
  const poolId = React.useMemo(() => new PublicKey(params.poolId!), [params.poolId])
  const { data, isLoading } = useSWR("pool-" + params.poolId!, () => fetchPool(program.provider.connection, poolId))

  if (isLoading) {
    return (
      <Flex align="center" justify="center" p="4">
        <Spinner />
      </Flex>
    )
  }

  return (
    <>
      {data && (
        <PoolManager pool={data} />
      )}
    </>
  )
}
