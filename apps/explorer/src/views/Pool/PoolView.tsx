import { GearIcon, InfoCircledIcon, PlusIcon, RocketIcon } from "@radix-ui/react-icons"
import { Badge, Box, Button, Card, Dialog, Flex, Grid, Heading, IconButton, Link, Tabs, Text } from "@radix-ui/themes"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { BPS_PER_WHOLE, decodeGambaState, getGambaStateAddress, getPoolBonusAddress, getPoolLpAddress } from "gamba-core-v2"
import { useAccount, useGambaProgram, useWalletAddress } from "gamba-react-v2"
import React, { ReactNode } from "react"
import { NavLink, useNavigate, useParams } from "react-router-dom"
import styled, { css } from "styled-components"
import useSWR from "swr"

import RecentPlays, { TimeDiff } from "@/RecentPlays"
import { fetchChart, fetchDailyVolume, fetchPoolChanges } from "@/api"
import { LineChart, LineChartDataPoint } from "@/charts/LineChart"
import { SolanaAddress } from "@/components/SolanaAddress"
import { Spinner } from "@/components/Spinner"
import { useBalance } from "@/hooks"
import { UiPool, fetchPool } from "@/views/Dashboard/PoolList"

import { TokenAvatar } from "@/components"
import { TokenValue2 } from "@/components/TokenValue2"
import { useTokenMeta } from "@/hooks/useTokenMeta"
import { PoolJackpotDeposit } from "./PoolJackpotDeposit"
import { PoolMintBonus } from "./PoolMintBonus"
import { PoolWithdraw } from "./PoolWithdraw"
import { ConnectUserCard } from "../Debug/DebugUser"

function ThingCard(props: { title: string, children: ReactNode }) {
  return (
    <Card size="1">
      <Flex direction="column">
        <Text color="gray" size="2">
          {props.title}
        </Text>
        <Text size="2" weight="bold">
          {props.children}
        </Text>
      </Flex>
    </Card>
  )
}

const chartIds = ["price", "volume", "liquidity"] as const

type ChartId = typeof chartIds[number]

const chartNames: Record<ChartId, string> = {
  price: "LP Price",
  volume: "Volume",
  liquidity: "Liquidity",
}

const ButtonGroup = styled.div`
  display: flex;
  gap: 5px;
  border-radius: 50px;
  padding: 6px;
  background: var(--slate-6);
  align-items: center;
`

const SelectableButton = styled.button<{$selected: boolean}>`
  all: unset;
  cursor: pointer;
  border-radius: 50px;
  background: transparent;
  padding: 2px 6px;
  color: white;
  font-weight: bold;
  font-size: 12px;
  &:hover {
    background: var(--slate-5);
  }
  ${props => props.$selected && css`
    background: var(--slate-1);
  `}
`

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
  const isPoolAuthority = userPublicKey && pool?.state?.poolAuthority?.equals(userPublicKey)
  const isGambaStateAuthority = userPublicKey && gambaState?.authority?.equals(userPublicKey)

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
          <Heading>Pool Details</Heading>
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
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  )
}
function PoolManager({ pool }: {pool: UiPool}) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const navigate = useNavigate()
  const token = useTokenMeta(pool.underlyingTokenMint)
  const balances = useBalance(pool.underlyingTokenMint)

  const [chartId, setChart] = React.useState<ChartId>("price")
  const [hovered, hover] = React.useState<LineChartDataPoint | null>(null)

  const gambaState = useAccount(getGambaStateAddress(), decodeGambaState)
  const maxPayoutPercent = gambaState && gambaState.maxPayoutBps ? gambaState.maxPayoutBps.toNumber() / BPS_PER_WHOLE : 0
  const jackpotPayoutPercentage = gambaState && gambaState.jackpotPayoutToUserBps ? gambaState.jackpotPayoutToUserBps.toNumber() / BPS_PER_WHOLE : 0

  const { data: dailyVolume = [] } = useSWR("daily-" + pool.publicKey.toBase58(), () => fetchDailyVolume(pool.publicKey))
  const { data: ratioData = [] } = useSWR("ratio-" + pool.publicKey.toBase58(), () => fetchChart(pool.publicKey))
  const { data: poolChanges = [] } = useSWR("poolChanges-" + pool.publicKey.toBase58(), () => fetchPoolChanges(connection, pool.publicKey))

  const chart = React.useMemo(
    () => {
      if (chartId === "volume")
        return {
          data: dailyVolume.map(
            ({ date, total_volume }) => ({
              date,
              value: total_volume,
            }),
          ),
        }
      if (chartId === "liquidity")
        return {
          data: ratioData.map(
            ({ date, pool_liquidity }) => ({
              date,
              value: pool_liquidity,
            }),
          ),
        }
      if (chartId === "price")
        return {
          data: ratioData.map(
            ({ date, pool_liquidity, lp_supply }) => ({
              date,
              value: lp_supply ? (pool_liquidity / lp_supply) : 1,
            }),
          ),
        }

      return { data: [] }
    },
    [chartId, ratioData, dailyVolume],
  )

  const totalVolume = React.useMemo(() => dailyVolume.reduce((prev, x) => prev + x.total_volume, 0) ?? 0, [dailyVolume])

  return (
    <Grid gap="4">
      <Flex justify={{ sm: "between" }} align={{ sm: "end" }} py="4" direction={{ initial: "column", sm: "row" }} gap="4">
        <Flex direction="column" gap="4">
          <PoolHeader pool={pool} />
        </Flex>
        <ResponsiveButtonContainer align="center" gap="4">
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
          <Button variant="soft" onClick={() => window.open(`https://jup.ag/swap/SOL-${token.mint.toBase58()}`)} size="3">
            Buy {token.symbol}
          </Button>
          <Button onClick={() => navigate("/pool/" + pool.publicKey.toBase58() + "/deposit")} size="3">
            Add Liqudity <RocketIcon />
          </Button>
        </Flex>
        </ResponsiveButtonContainer>
      </Flex>
      <Grid gap="2" columns="1">
        <Flex gap="2" wrap="wrap">
          <Flex gap="2" wrap="wrap">
            <ThingCard title="LP price">
              {pool.ratio.toLocaleString(undefined, { maximumFractionDigits: 3 })} {token.symbol}
            </ThingCard>
          </Flex>
          <ThingCard title="Liqudity">
            <TokenValue2 mint={pool.underlyingTokenMint} amount={Number(pool.liquidity)} />
          </ThingCard>
          <ThingCard title="LP Token Supply">
            <TokenValue2 mint={pool.underlyingTokenMint} amount={Number(pool.lpSupply)} />
          </ThingCard>
          <ThingCard title="Max Payout">
            <TokenValue2 mint={pool.underlyingTokenMint} amount={Number(pool.state.liquidityCheckpoint) * maxPayoutPercent} />
          </ThingCard>
          <ThingCard title="Circulating Bonus">
            <TokenValue2 mint={pool.underlyingTokenMint} amount={Number(pool.bonusBalance)} />
          </ThingCard>
          <ThingCard title="Jackpot">
            <TokenValue2 exact mint={pool.underlyingTokenMint} amount={Number(pool.jackpotBalance) * jackpotPayoutPercentage} />
          </ThingCard>
          <ThingCard title="Total Plays">
            {pool.plays.toLocaleString(undefined)}
          </ThingCard>
        </Flex>
        <Card>
          <Flex justify="between" align="start">
            <Flex direction="column" gap="2">
              <Text size="7" weight="bold">
                {chartId === "liquidity" && (
                  <TokenValue2
                    exact
                    mint={pool.underlyingTokenMint}
                    amount={hovered?.value ?? Number(pool.liquidity)}
                  />
                )}
                {chartId === "volume" && (
                  <TokenValue2
                    exact
                    mint={pool.underlyingTokenMint}
                    amount={hovered?.value ?? totalVolume}
                  />
                )}
                {chartId === "price" && (
                  <>
                    {(hovered?.value ?? pool.ratio).toLocaleString(undefined, { maximumFractionDigits: 3 })} {token.symbol}
                  </>
                )}
              </Text>
              <Text color="gray">
                {new Date(hovered?.date ?? Date.now()).toLocaleString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </Flex>
            <ButtonGroup>
              {chartIds.map(id => (
                <SelectableButton key={id} onClick={() => setChart(id)} $selected={id === chartId}>
                  {chartNames[id]}
                </SelectableButton>
              ))}
            </ButtonGroup>
          </Flex>
          <div style={{ height: "200px" }}>
            <LineChart
              chart={chart}
              onHover={hover}
              lineColor="#8280ff"
            />
          </div>
        </Card>
      </Grid>
      {balances.lpBalance > 0 ? (
        <Card size="3">
          <Grid gap="2">
            <Text color="gray">
              Your position
            </Text>
            <Text size="5">
              <Text color="gray">
                <TokenValue2 exact mint={pool.underlyingTokenMint} amount={balances.lpBalance} suffix="LP" />
                {" = "}
              </Text>
              <Text weight="bold">
                <TokenValue2 exact mint={pool.underlyingTokenMint} amount={balances.lpBalance * pool.ratio} />
              </Text>
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
            <RecentPlays pool={pool.publicKey} />
          </Tabs.Content>
          <Tabs.Content value="deposits">
            <Card>
              <Grid gap="2">
                {poolChanges.map(
                  (change, i) => {
                    return (
                      <Card key={i} size="1">
                        <Flex justify="between" align="center">
                          <Flex gap="2" align="center">
                            <SolanaAddress truncate address={change.data.user} />
                            <Badge color={change.data.action.deposit ? "green" : "red"}>
                              {change.data.action.deposit ? "+" : "-"}
                              <TokenValue2 exact mint={pool.underlyingTokenMint} amount={change.data.amount.toNumber()} />
                            </Badge>
                          </Flex>
                          <Link target="_blank" href={"https://solscan.io/tx/" + change.signature}>
                            <TimeDiff time={change.time} />
                          </Link>
                        </Flex>
                      </Card>
                    )
                  },
                )}
              </Grid>
            </Card>

          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Grid>
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
    );
  }
  return (
    <>
      {data && (
        <PoolManager pool={data} />
      )}
    </>
  )
}
