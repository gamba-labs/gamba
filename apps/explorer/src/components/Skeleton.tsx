import { Card } from "@radix-ui/themes"
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
  if (loading) return <SkeletonText {...rest} />
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
  border-radius: 10px;
`

export const SkeletonBarChart = () => {
  return (
    <BarChartWrapper>
      {Array.from({length: 8})
        .map((_ ,i) => (
          <Bar key={i} style={{height: 50 + (Math.sin(i) * 25) + '%'}} />
        ))}
    </BarChartWrapper>
  )
}
