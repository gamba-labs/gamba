import { ProgramAccount } from "@coral-xyz/anchor"
import { Avatar, Badge, Button, Flex, IconButton, Table, Text } from "@radix-ui/themes"
import { NATIVE_MINT } from "@solana/spl-token"
import { useConnection } from "@solana/wallet-adapter-react"
import { Connection, PublicKey } from "@solana/web3.js"
import { decodePool, getPoolBonusUnderlyingTokenAccountAddress, getPoolJackpotTokenAccountAddress, getPoolLpAddress, getPoolUnderlyingTokenAccountAddress, PoolState } from "gamba-core-v2"
import { useAccount, useGambaProgram } from "gamba-react-v2"
import { TokenValue, useTokenMeta } from "gamba-react-ui-v2"
import React from "react"
import styled from "styled-components"
import useSWR from "swr"

import { decodeAta, fetchJupiterTokenList, formatTokenAmount} from "@/hooks"

import { TokenAvatar } from "./components"
import { TableRowNavLink } from "./components/TableRowLink"
import { SYSTEM_PROGRAM } from "./constants"
import { ArrowRightIcon } from "@radix-ui/react-icons"

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

function PoolTableRow({ pool, jupiterTokens }: { pool: ProgramAccount<PoolState>; jupiterTokens: any[] }) {
  const populated = usePopulatedPool(pool);

  // Find the Jupiter token that matches the pool's underlying token mint
  const jupiterToken = jupiterTokens.find(jt => jt.mint.equals(pool.account.underlyingTokenMint));
  
  return (
    <TableRowNavLink to={"/pool/" + pool.publicKey.toBase58()}>
      <StyledTableCell>
        <Flex gap="4" align="center">
          <Avatar
            radius="full"
            fallback="?"
            size="2"
            color="green"
            src={jupiterToken?.image} // Use Jupiter token logo
          />
          <Text>{jupiterToken?.name || 'Unknown'}</Text> 
          <Text size="2" color="gray">{jupiterToken?.symbol || pool.account.underlyingTokenMint.toBase58().substring(0, 3)}</Text>
          {!pool.account.poolAuthority.equals(SYSTEM_PROGRAM) ? (
            <Badge color="orange">PRIVATE</Badge>
          ) : (
            <Badge color="green">PUBLIC</Badge>
          )}
        </Flex>
      </StyledTableCell>
      <StyledTableCell>
      <SkeletonFallback loading={populated.isLoading}>
      {populated.data ? (
            <Flex align="center">
              <TokenValue
                exact
                mint={pool.account.underlyingTokenMint}
                amount={Number(populated.data.liquidity)}
              />
              {/* {formatTokenAmount(populated.data.liquidity, jupiterToken?.decimals ?? 0, jupiterToken?.symbol)} placeholder until we fix TokenValue */}
            </Flex>
          ) : (
            <SkeletonText />
          )}
        </SkeletonFallback>
      </StyledTableCell>
      <StyledTableCell>
        <SkeletonFallback loading={populated.isLoading}>
          {populated.data?.ratio.toFixed(3)}
        </SkeletonFallback>
      </StyledTableCell>
      <StyledTableCell />
      {/* <StyledTableCell>
        <SkeletonFallback loading={populated.isLoading}>
          <TokenValue mint={token.mint} amount={Number(populated.data?.jackpotBalance)} />
        </SkeletonFallback>
      </StyledTableCell> */}
      {/* <StyledTableCell align="center">
        <SkeletonFallback loading={populated.isLoading}>
          {populated.data?.poolAuthority.equals(SYSTEM_PROGRAM) && (
            <Button variant="soft" size="1" radius="full">
              Stake <ArrowRightIcon />
            </Button>
          )}
        </SkeletonFallback>
      </StyledTableCell> */}
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

export function PoolList() {
  const program = useGambaProgram()
  const legacyPool = useAccount(new PublicKey("7qNr9KTKyoYsAFLtavitryUXmrhxYgVg2cbBKEN5w6tu"), info => info?.lamports ?? 0)
  const { data: pools = [], isLoading: isLoadingPools } = useSWR("pools", () => program.account.pool.all())

  const [jupiterTokens, setJupiterTokens] = React.useState([]);

  React.useEffect(() => {
    fetchJupiterTokenList()
      .then(setJupiterTokens)
      .catch(console.error);
  }, [])

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
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Token</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Liquidity</Table.ColumnHeaderCell>
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
                  jupiterTokens={jupiterTokens} 
                />
              ))}
              <Table.Row style={{ cursor: "not-allowed" }}>
                <StyledTableCell>
                  <Flex gap="4" align="center">
                    <TokenAvatar mint={NATIVE_MINT} size="2" />
                    <Text>Legacy Pool</Text>
                    <Text size="2" color="gray">SOL</Text>
                    <Badge color="orange">DEPRECATED</Badge>
                  </Flex>
                </StyledTableCell>
                <StyledTableCell>
                  <Flex gap="2" align="center">
                    <TokenValue mint={NATIVE_MINT} amount={legacyPool} />
                  </Flex>
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
