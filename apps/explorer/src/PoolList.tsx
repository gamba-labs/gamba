import { decodeAta } from "@/hooks"
import { ProgramAccount } from "@coral-xyz/anchor"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { Avatar, Badge, Box, Button, Card, Flex, Table, Text } from "@radix-ui/themes"
import { NATIVE_MINT } from "@solana/spl-token"
import { useConnection } from "@solana/wallet-adapter-react"
import { Connection, PublicKey } from "@solana/web3.js"
import { PoolState, decodePool, getPoolBonusUnderlyingTokenAccountAddress, getPoolJackpotTokenAccountAddress, getPoolLpAddress, getPoolUnderlyingTokenAccountAddress } from "gamba-core-v2"
import { useAccount, useGambaProgram } from "gamba-react-v2"
import React from "react"
import { NavLink } from "react-router-dom"
import styled from "styled-components"
import useSWR from "swr"
import { DailyVolume, fetchDailyTotalVolume, fetchTopCreators } from "./api"
import { TokenAvatar } from "./components"
import { PlatformAccountItem } from "./components/AccountItem"
import { TableRowNavLink } from "./components/TableRowLink"
import { TokenValue2 } from "./components/TokenValue2"
import { SYSTEM_PROGRAM } from "./constants"
import { useTokenMeta } from "./hooks/useTokenMeta"
import { BarChart } from "./charts/BarChart"

const SkeletonText = styled.div`
  height: 1em;
  min-width: 40px;
  background: #cccccccc;
  border-radius: 5px;
`

const StyledTableCell = styled(Table.Cell)`
  vertical-align: middle;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`

export interface UiPool {
  publicKey: PublicKey
  underlyingTokenMint: PublicKey
  poolAuthority: PublicKey
  state: PoolState
  liquidity: bigint
  lpSupply: bigint
  ratio: number
  bonusBalance: bigint
  jackpotBalance: bigint
  plays: number
}

export const SkeletonFallback = (props: React.PropsWithChildren<{loading: boolean}>) => {
  if (props.loading) return <SkeletonText />
  return props.children
}

function PoolTableRow({ pool }: { pool: ProgramAccount<PoolState> }) {
  const populated = usePopulatedPool(pool)
  const token = useTokenMeta(pool.account.underlyingTokenMint)

  return (
    <TableRowNavLink to={"/pool/" + pool.publicKey.toBase58()}>
      <StyledTableCell>
        <Flex gap="4" align="center">
          <TokenAvatar mint={pool.account.underlyingTokenMint} size="2" />
          <Text>{token.name}</Text>
          <Text size="2" color="gray">
            {token.symbol}
          </Text>
          {!pool.account.poolAuthority.equals(SYSTEM_PROGRAM) ? (
            <Badge color="orange">PRIVATE</Badge>
          ) : (
            <Badge color="green">PUBLIC</Badge>
          )}
        </Flex>
      </StyledTableCell>
      <StyledTableCell>
        <SkeletonFallback loading={populated.isLoading}>
          <Flex align="center">
            <TokenValue2
              mint={pool.account.underlyingTokenMint}
              amount={Number(populated.data?.liquidity)}
            />
          </Flex>
        </SkeletonFallback>
      </StyledTableCell>
      <StyledTableCell>
        <SkeletonFallback loading={populated.isLoading}>
          <Flex align="center">
            <TokenValue2
              dollar
              mint={pool.account.underlyingTokenMint}
              amount={Number(populated.data?.liquidity)}
            />
          </Flex>
        </SkeletonFallback>
      </StyledTableCell>
      <StyledTableCell>
        <SkeletonFallback loading={populated.isLoading}>
          {populated.data?.ratio.toFixed(3)}
        </SkeletonFallback>
      </StyledTableCell>
      <StyledTableCell />
    </TableRowNavLink>
  )
}

const populatePool = async (
  connection: Connection,
  publicKey: PublicKey,
  state: PoolState,
): Promise<UiPool> => {
  const { value: lp } = await connection.getTokenSupply(getPoolLpAddress(publicKey))
  const underlyingAccount = decodeAta(await connection.getAccountInfo(getPoolUnderlyingTokenAccountAddress(publicKey)))
  const bonusUnderlyingTokenAccount = decodeAta(await connection.getAccountInfo(getPoolBonusUnderlyingTokenAccountAddress(publicKey)))
  const underlyingBalance = underlyingAccount?.amount ?? BigInt(0)
  const bonusBalance = bonusUnderlyingTokenAccount?.amount ?? BigInt(0)
  const jackpotUnderlyingTokenAccount = decodeAta(await connection.getAccountInfo(getPoolJackpotTokenAccountAddress(publicKey)))
  const jackpotBalance = jackpotUnderlyingTokenAccount?.amount ?? BigInt(0)
  const lpSupply = BigInt(lp.amount)
  const ratio = !lpSupply ? 1 : Number(underlyingBalance) / Number(lpSupply)
  return {
    publicKey,
    state,
    liquidity: underlyingBalance,
    underlyingTokenMint: state.underlyingTokenMint,
    lpSupply,
    bonusBalance,
    jackpotBalance,
    ratio,
    poolAuthority: state.poolAuthority,
    plays: Number(state.plays),
  }
}

export async function fetchPool(connection: Connection, publicKey: PublicKey) {
  const pool = decodePool(await connection.getAccountInfo(publicKey))
  if (!pool) return null
  return await populatePool(connection, publicKey, pool)
}

export function usePopulatedPool(account: ProgramAccount<PoolState>) {
  const { connection } = useConnection()
  return useSWR("populated-pool-" + account.publicKey.toBase58(), () => populatePool(connection, account.publicKey, account.account))
}

const StyledLink = styled(NavLink)`
  cursor: pointer;
  text-decoration: unset;
  color: unset;
`

function TopCreators() {
  const { data: topCreators = [] } = useSWR("top-creators", fetchTopCreators)

  return (
    <Box>
      <Flex wrap="wrap" gap="4">
        {topCreators.slice(0, 6).map((x, i) => {
          return (
            <StyledLink key={i} to={`/platform/${x.creator}`}>
              <Card>
                <PlatformAccountItem avatarSize="1" address={x.creator} />
                <Text weight="bold">${x.usd_volume.toLocaleString(undefined, {maximumFractionDigits: 2})}</Text>
              </Card>
            </StyledLink>
          )
        })}
      </Flex>
    </Box>
  )
}

function TotalVolume() {
  const { data: daily = [] } = useSWR("daily-usd", fetchDailyTotalVolume)
  const [hovered, setHovered] = React.useState<DailyVolume | null>(null)
  const total = React.useMemo(
    () => daily.reduce((p, x) => p + x.total_volume, 0),
    [daily]
  )

  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <Text color="gray">
          {hovered?.date ? new Date(hovered.date).toLocaleString(undefined, {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '30d Volume'}
        </Text>
        <Text size="7" weight="bold">
          ${(hovered?.total_volume ?? total).toLocaleString(undefined, {maximumFractionDigits: 1})}
        </Text>
      </Flex>
      <div style={{height: '200px'}}>
        <BarChart
          dailyVolume={daily}
          onHover={setHovered}
        />
      </div>
    </Card>
  )
}

export function PoolList() {
  const program = useGambaProgram()
  const legacyPool = useAccount(new PublicKey("7qNr9KTKyoYsAFLtavitryUXmrhxYgVg2cbBKEN5w6tu"), info => info?.lamports ?? 0)
  const { data: pools = [], isLoading: isLoadingPools } = useSWR("pools", () => program.account.pool.all())

  const sortedPools = React.useMemo(
    () => {
      return pools.sort((a, b) => {
        const playsDiff = b.account.plays.toNumber() - a.account.plays.toNumber()
        if (playsDiff) return playsDiff
        const liqudityDiff = b.account.liquidityCheckpoint.toNumber() - a.account.liquidityCheckpoint.toNumber()
        if (liqudityDiff) return liqudityDiff
        return a.publicKey.toString() > b.publicKey.toString() ? 1 : -1
      })
    },
    [pools],
  )

  return (
    <Flex direction="column" gap="4">
      <TopCreators />
      <TotalVolume />
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Token</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Liquidity</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>TVL</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Ratio</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoadingPools ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <Table.Row key={i}>
                  <StyledTableCell>
                    <Flex gap="4" align="center">
                      <Avatar
                        fallback="-"
                        size="2"
                      />
                      <SkeletonText style={{ width: "150px" }} />
                    </Flex>
                  </StyledTableCell>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <StyledTableCell key={i}>
                      <SkeletonText />
                    </StyledTableCell>
                  ))}
                </Table.Row>
              ))}
            </>
          ) : (
            <>
              {sortedPools.map(pool => (
                <PoolTableRow
                  key={pool.publicKey.toBase58()}
                  pool={pool}
                />
              ))}
              <Table.Row style={{ cursor: "not-allowed" }}>
                <StyledTableCell>
                  <Flex gap="4" align="center">
                    <TokenAvatar mint={NATIVE_MINT} size="2" />
                    <Text>Legacy Pool</Text>
                    <Text size="2" color="gray">SOL</Text>
                  </Flex>
                </StyledTableCell>
                <StyledTableCell>
                  <TokenValue2 mint={NATIVE_MINT} amount={legacyPool} />
                </StyledTableCell>
                <StyledTableCell>
                  <TokenValue2 dollar mint={NATIVE_MINT} amount={legacyPool} />
                </StyledTableCell>
                <StyledTableCell>
                  -
                </StyledTableCell>
                <Table.ColumnHeaderCell>
                  <Button size="1" variant="soft" onClick={() => window.open("https://old.gamba.so")}>
                    V1 Explorer <ArrowRightIcon />
                  </Button>
                </Table.ColumnHeaderCell>
              </Table.Row>
            </>
          )}
        </Table.Body>
      </Table.Root>
    </Flex>
  )
}
