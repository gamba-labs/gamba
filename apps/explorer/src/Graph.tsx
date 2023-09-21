import { GradientOrangeRed } from '@visx/gradient'
import { Group } from '@visx/group'
import { ParentSize } from '@visx/responsive'
import { Bar } from '@visx/shape'
import React, { useMemo } from 'react'
import { scaleBand, scaleLinear } from '@visx/scale'
import { DailyVolume } from './data'

const getLetter = (d: DailyVolume) => d.date
const getLetterFrequency = (d: DailyVolume) => Number(d.total_volume) * 100

export type BarsProps = {
  width: number
  height: number
  events?: boolean
  dailyVolume: DailyVolume[]
};

function _BarGraph({ width, height, events = false, dailyVolume }: BarsProps) {
  // bounds
  const xMax = width
  const yMax = height

  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        round: true,
        domain: dailyVolume.map(getLetter),
        padding: 0.4,
      }),
    [dailyVolume, xMax],
  )
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...dailyVolume.map(getLetterFrequency))],
      }),
    [dailyVolume, yMax],
  )

  return (
    <svg width={width} height={height}>
      <GradientOrangeRed id="teal" />
      <rect width={width} height={height} fill="url(#teal)" rx={14} />
      <Group>
        {dailyVolume.map((d) => {
          const letter = getLetter(d)
          const barWidth = xScale.bandwidth()
          const barHeight = yMax - (yScale(getLetterFrequency(d)) ?? 0)
          const barX = xScale(letter)
          const barY = yMax - barHeight
          return (
            <Bar
              key={`bar-${letter}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill="rgba(255, 255, 217, .5)"
              onClick={() => {
                if (events) alert(`clicked: ${JSON.stringify(Object.values(d))}`)
              }}
            />
          )
        })}
      </Group>
    </svg>
  )
}

export function BarGraph({ dailyVolume }: {dailyVolume: DailyVolume[]}) {
  return (
    <ParentSize>
      {(parent) => (
        <>
          <_BarGraph
            width={parent.width}
            height={parent.height}
            dailyVolume={dailyVolume}
          />
        </>
      )}
    </ParentSize>
  )
}
