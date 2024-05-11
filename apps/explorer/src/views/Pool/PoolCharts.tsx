import { Card, Flex, Text } from "@radix-ui/themes"
import React from "react"
import styled, { css } from "styled-components"

import { DailyVolume, RatioData, useApi } from "@/api"
import { LineChart, LineChartDataPoint } from "@/charts/LineChart"

import { SkeletonBarChart } from "@/components/Skeleton"
import { TokenValue2 } from "@/components/TokenValue2"
import { useTokenMeta } from "@/hooks"
import { UiPool } from "../Dashboard/PoolList"
import { usePoolId } from "./PoolView"

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
  background: var(--slate-1);
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
    background: var(--accent-9)!important;
  `}
`

export function PoolCharts({pool}: {pool: UiPool}) {
  const publicKey = usePoolId()
  const token = useTokenMeta(pool.underlyingTokenMint)
  const [chartId, setChart] = React.useState<ChartId>("price")
  const [hovered, hover] = React.useState<LineChartDataPoint | null>(null)
  const { data: dailyVolume = [], isLoading: isLoadingDailyVolume } = useApi<DailyVolume[]>("/daily", {pool: publicKey.toString()})
  const { data: ratioData = [], isLoading: isLoadingRatioData, } = useApi<RatioData[]>("/ratio", {pool: publicKey.toString()})
  const totalVolume = React.useMemo(() => dailyVolume.reduce((prev, x) => prev + x.total_volume, 0) ?? 0, [dailyVolume])

  const chart = React.useMemo(
    () => {
      if (chartId === "volume")
        return {
          isLoading: isLoadingDailyVolume,
          data: dailyVolume.map(
            ({ date, total_volume }) => ({
              date,
              value: total_volume,
            }),
          ),
        }
      if (chartId === "liquidity")
        return {
          isLoading: isLoadingDailyVolume,
          data: ratioData.map(
            ({ date, pool_liquidity }) => ({
              date,
              value: pool_liquidity,
            }),
          ),
        }
      if (chartId === "price")
        return {
          isLoading: isLoadingRatioData,
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

  return (
    <>
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
          {chart.isLoading ? (
            <SkeletonBarChart bars={60} />
          ) : (
            <LineChart
              chart={chart}
              onHover={hover}
              lineColor="#8280ff"
            />
          )}
        </div>
      </Card>
    </>
  )
}
