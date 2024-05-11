import { Avatar, Card, Flex, Table } from "@radix-ui/themes"
import { CardProps } from "@radix-ui/themes/dist/cjs/components/card"
import React from 'react'
import styled, { keyframes } from "styled-components"

const skeletonShine = keyframes`
  0%, 100% {
    background-color: #DDDBDD33;
  }
  50% {
    background-color: #DDDBDD22;
  }
`

export const SkeletonCard = styled(Card)`
  overflow: hidden;
  border-radius: var(--radius-4);
  height: 56px;
  animation: ${skeletonShine} 1s linear infinite;
`

export const SkeletonText = styled.div`
  height: 24px;
  min-width: 40px;
  animation: ${skeletonShine} 1s linear infinite;
  border-radius: 5px;
`

export const SkeletonFallback = (props: React.PropsWithChildren<{loading: boolean}>) => {
  const {children, loading, ...rest} = props
  if (loading) {
    return <SkeletonText {...rest} />
  }
  return children
}

const BarChartWrapper = styled.div`
  display: flex;
  gap: 5px;
  width: 100%;
  height: 100%;
  justify-content: end;
  align-items: end;
`

const Bar = styled.div`
  width: 20%;
  height: 100%;
  animation: ${skeletonShine} 1s linear infinite;
  border-radius: 5px;
`

export function SkeletonCardList(props: {cards: number} & CardProps) {
  const {cards, ...rest} = props
  return (
    <>
      {Array.from({length: cards}).map((_, i) => <SkeletonCard key={i} {...rest} />)}
    </>
  )
}

export const SkeletonBarChart = ({bars = 8}: {bars?: number}) => {
  return (
    <BarChartWrapper>
      {Array.from({length: bars})
        .map((_ ,i) => (
          <Bar
            key={i}
            style={{
              width: 100 / bars + '%',
              height: 50 + (Math.sin(i / bars * 2) * 25 + Math.cos(i / bars * 50) * 5 - Math.abs(Math.cos(i / bars * 10) * 20)) + '%',
            }}
          />
        ))}
    </BarChartWrapper>
  )
}

export const SkeletonTableRows = ({rows = 3, cells = 3}: {rows?: number, cells?: number}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <Table.Row key={i}>
          {Array.from({ length: cells }).map((_, i) => (
            <Table.Cell key={i}>
              <SkeletonText />
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  )
}
