import { ProgramAccount } from "@coral-xyz/anchor"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { Avatar, Button, Card, Flex, Grid, Heading } from "@radix-ui/themes"
import { getPoolLpAddress, PoolState } from "gamba-core-v2"
import { useGambaProgram } from "gamba-react-v2"
import { TokenValue} from "gamba-react-ui-v2"
import React from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"

import { TokenAvatar } from "@/components"
import { Spinner } from "@/components/Spinner"
import { useTokenList, formatTokenAmount, fetchJupiterTokenList} from "@/hooks"
import { SkeletonFallback, usePopulatedPool } from "@/PoolList"

interface Position {
  pool: ProgramAccount<PoolState>
  lpBalance: number
}

function PortfolioItem({ position, jupiterTokens }: { position: Position, jupiterTokens: any[] }) {
  const navigate = useNavigate()
  const { pool, lpBalance } = position
  const populated = usePopulatedPool(pool)
  const ratio = populated.data?.ratio ?? 1

  const jupiterToken = jupiterTokens.find(jt => jt.mint.equals(pool.account.underlyingTokenMint));
  const decimals = jupiterToken?.decimals ?? 0;

  
  const lpBalanceBigInt = BigInt(lpBalance)
  const ratioBigInt = BigInt(Math.round(ratio * (10 ** decimals)))
  const totalValueBigInt = (lpBalanceBigInt * ratioBigInt) / BigInt(10 ** decimals)
  
  return (
    <Card key={pool.publicKey.toBase58()}>
      <Flex justify="between" align="center">
        <Flex align="center" gap="2">
        <Avatar
          radius="full"
          fallback="?"
          size="3"
          color="green"
          src={jupiterToken?.image || ''} 
        />
          <SkeletonFallback loading={populated.isLoading}>
            {/* <TokenValue
              mint={pool.account.underlyingTokenMint}
              amount={lpBalance * ratio}
            /> */}
            {formatTokenAmount(totalValueBigInt, decimals)} {jupiterToken?.symbol}

          </SkeletonFallback>
        </Flex>
        <Button onClick={() => navigate("/pool/" + pool.publicKey.toBase58())} variant="soft">
          View <ArrowRightIcon />
        </Button>
      </Flex>
    </Card>
  )
}

export default function PortfolioView() {
  const program = useGambaProgram()
  const { data: pools = [], isLoading: isLoadingPools } = useSWR("pools", () => program.account.pool.all())
  const tokens = useTokenList()

  const [jupiterTokens, setJupiterTokens] = React.useState([])

  React.useEffect(() => {
    fetchJupiterTokenList().then(setJupiterTokens).catch(console.error)
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
        .map(pool => {
          const lpAccount = tokens.find(t => t.mint.equals(getPoolLpAddress(pool.publicKey)))
          const lpBalance = lpAccount?.amount ?? 0
          return { pool, lpBalance }
        })
        .filter(x => x.lpBalance > 0)
    },
    [pools, tokens],
  )

  return (
    <Card size="3">
      <Grid gap="4">
        <Heading>Portfolio</Heading>
        {isLoadingPools && (
          <Flex align="center" justify="center" p="4">
            <Spinner />
          </Flex>
        )}
        <Grid gap="2">
          {sortedPools.map(position => (
            <PortfolioItem key={position.pool.publicKey.toBase58()} position={position} jupiterTokens={jupiterTokens} />
          ))}
        </Grid>
      </Grid>
    </Card>
  )
}
