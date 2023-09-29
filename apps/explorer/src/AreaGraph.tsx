import { curveMonotoneX } from '@visx/curve'
import { localPoint } from '@visx/event'
import { GradientOrangeRed, LinearGradient } from '@visx/gradient'
import { ParentSize } from '@visx/responsive'
import { scaleBand, scaleLinear, scaleTime } from '@visx/scale'
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape'
import { TooltipWithBounds, defaultStyles, withTooltip } from '@visx/tooltip'
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip'
import { bisector, extent, max } from '@visx/vendor/d3-array'
import React, { useCallback, useMemo } from 'react'
import { Money } from './Money'
import { DailyVolume } from './data'
import { Group } from '@visx/group'

type TooltipData = DailyVolume

const accentColor = '#fffeea'
const tooltipStyles = {
  ...defaultStyles,
  border: '1px solid white',
  background: '#ffffff',
  color: 'black',
  zIndex: 1000,
}

const calculateMovingAverage = (data: DailyVolume[], windowSize: number) => {
  return data.map((d, i) => {
    const startIndex = Math.max(0, i - windowSize + 1)
    const valuesInRange = data.slice(startIndex, i + 1)
    const sum = valuesInRange.reduce((acc, value) => acc + getDailyVolume(value), 0)
    const average = sum / valuesInRange.length
    return { ...d, movingAverage: average }
  })
}

// accessors
const getDate = (d: DailyVolume) => new Date(d.date)
const getDailyVolume = (d: DailyVolume) => d.total_volume

const bisectDate = bisector<DailyVolume, Date>((d) => new Date(d.date)).left

export type AreaProps = {
  width: number
  height: number
  dailyVolume: DailyVolume[]
};

const _AreaGraph = withTooltip<AreaProps, TooltipData>(
  ({
    width,
    height,
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
    dailyVolume,
  }: AreaProps & WithTooltipProvidedProps<TooltipData>) => {
    const innerWidth = width
    const innerHeight = height

    const movingAverageWindowSize = 14
    const dataWithMovingAverage = useMemo(
      () =>
        calculateMovingAverage(dailyVolume, movingAverageWindowSize),
      [dailyVolume],
    )

    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [0, innerWidth + 0],
          domain: extent(dailyVolume, getDate) as [Date, Date],
        }),
      [dailyVolume, innerWidth],
    )

    const dailyVolumeScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight, 0],
          domain: [0, (max(dataWithMovingAverage, (d) => d.movingAverage) || 0) + innerHeight / 3],
          nice: true,
        }),
      [dataWithMovingAverage, innerHeight],
    )

    const handleTooltip = useCallback(
      (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
        if (dataWithMovingAverage.length === 0) return
        const { x } = localPoint(event) || { x: 0 }
        const x0 = dateScale.invert(x)
        const index = bisectDate(dataWithMovingAverage, x0, 1)
        const d0 = dataWithMovingAverage[index - 1]
        const d1 = dataWithMovingAverage[index]
        let d = d0
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0
        }

        // Calculate the interpolation factor between d0 and d1
        const interpolationFactor =
            (x0.valueOf() - getDate(d0).valueOf()) / (getDate(d1).valueOf() - getDate(d0).valueOf())

        // Interpolate the movingAverage value
        const movingAverage = d0.movingAverage + (d1.movingAverage - d0.movingAverage) * interpolationFactor

        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: dailyVolumeScale(movingAverage),
        })
      },
      [dataWithMovingAverage, showTooltip, dailyVolumeScale, dateScale],
    )

    // scales, memoize for performance
    const xScale = useMemo(
      () =>
        scaleBand<string>({
          range: [0, width],
          round: true,
          domain: dailyVolume.map((d) => getDate(d).toString()),
          padding: 0.2,
        }),
      [dailyVolume, width],
    )

    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [height, 0],
          round: true,
          domain: [0, Math.max(...dailyVolume.map(getDailyVolume))],
        }),
      [dailyVolume, height],
    )

    return (
      <div>
        <svg width={width} height={height}>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="url(#area-background-gradient)"
            rx={14}
          />
          <LinearGradient
            id="area-gradient"
            from="#ff6562"
            to="#ff255b"
            toOpacity={1}
          />
          <LinePath
            data={dataWithMovingAverage}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => dailyVolumeScale(d.movingAverage) ?? 0}
            // yScale={dailyVolumeScale}
            strokeWidth={1}
            strokeDasharray={10}
            opacity={.3}
            stroke="url(#area-gradient)"
            // fill="url(#area-gradient)"
            fill="transparent"
            curve={curveMonotoneX}
          />
          {/* <AreaClosed
            data={dataWithMovingAverage}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => dailyVolumeScale(d.movingAverage) ?? 0}
            yScale={dailyVolumeScale}
            strokeWidth={1}
            strokeDasharray={10}
            opacity={.3}
            stroke="url(#area-gradient)"
            // fill="url(#area-gradient)"
            fill="transparent"
            curve={curveMonotoneX}
          /> */}
          <Group>
            {dailyVolume.map((d) => {
              const date = getDate(d).toString()
              const barWidth = xScale.bandwidth()
              const barHeight = height - (yScale(getDailyVolume(d)) ?? 0)
              const barX = xScale(date)
              const barY = height - barHeight
              return (
                <Bar
                  key={`bar-${date}`}
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#area-gradient)"
                  // fillOpacity={.4}
                  rx={2}
                  // onClick={() => {
                  //   if (events) alert(`clicked: ${JSON.stringify(Object.values(d))}`)
                  // }}
                />
              )
            })}
          </Group>
          <Bar
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: 0 }}
                to={{ x: tooltipLeft, y: innerHeight }}
                stroke="#ffffff"
                strokeWidth={1}
                pointerEvents="none"
                strokeDasharray="5,2"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop + 1}
                r={4}
                fill="black"
                fillOpacity={0.1}
                stroke="black"
                strokeOpacity={0.1}
                strokeWidth={2}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={4}
                fill={'#8888cc'}
                stroke="white"
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
        {tooltipData && (
          <div>
            <TooltipWithBounds
              key={Math.random()}
              top={tooltipTop - 12}
              left={tooltipLeft + 12}
              style={tooltipStyles}
            >
              <div>{getDate(tooltipData).toDateString()}</div>
              <Money lamports={getDailyVolume(tooltipData)} />
            </TooltipWithBounds>
          </div>
        )}
      </div>
    )
  },
)

export function AreaGraph({ dailyVolume }: {dailyVolume: DailyVolume[]}) {
  return (
    <ParentSize>
      {(parent) => (
        <>
          <_AreaGraph
            width={parent.width}
            height={parent.height}
            dailyVolume={dailyVolume}
          />
        </>
      )}
    </ParentSize>
  )
}
