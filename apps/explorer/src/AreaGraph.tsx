import { curveMonotoneX } from '@visx/curve'
import { localPoint } from '@visx/event'
import { GradientOrangeRed, LinearGradient } from '@visx/gradient'
import { GridColumns, GridRows } from '@visx/grid'
import { ParentSize } from '@visx/responsive'
import { scaleLinear, scaleTime } from '@visx/scale'
import { AreaClosed, Bar, Line } from '@visx/shape'
import { Tooltip, TooltipWithBounds, defaultStyles, withTooltip } from '@visx/tooltip'
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip'
import { bisector, extent, max } from '@visx/vendor/d3-array'
import { timeFormat } from '@visx/vendor/d3-time-format'
import React, { useCallback, useMemo } from 'react'
import { DAILY_VOLUME, DailyVolume } from './data'

type TooltipData = DailyVolume;

const stock = DAILY_VOLUME.reduce(
  (prev, curr) => {
    const nextTotal = prev.total + curr.total_volume
    return {
      arr: [...prev.arr, {
        total_volume: nextTotal,
        daily: curr.total_volume,
        date: curr.date,
      }],
      total: nextTotal,
    }
  },
  { arr: [], total: 0 } as { arr: DailyVolume[], total: number },
).arr
const accentColor = '#edffea'
const accentColorDark = '#8888cc'
const tooltipStyles = {
  ...defaultStyles,
  border: '1px solid white',
  background: '#ffffff',
  color: 'black',
  zIndex: 1000,
}

const formatDate = timeFormat('%b %d, \'%y')

// accessors
const getDate = (d: DailyVolume) => new Date(d.date)
const getStockValue = (d: DailyVolume) => d.total_volume

const formatLamps = (lamports: number) => parseFloat((lamports / 1e9).toFixed(2))

const bisectDate = bisector<DailyVolume, Date>((d) => new Date(d.date)).left

export type AreaProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const _AreaGraph = withTooltip<AreaProps, TooltipData>(
  ({
    width,
    height,
    margin = { top: 0, right: 0, bottom: 0, left: 0 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  }: AreaProps & WithTooltipProvidedProps<TooltipData>) => {
    // bounds
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [margin.left, innerWidth + margin.left],
          domain: extent(stock, getDate) as [Date, Date],
        }),
      [innerWidth, margin.left],
    )
    const stockValueScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight + margin.top, margin.top],
          domain: [0, (max(stock, getStockValue) || 0) + innerHeight / 3],
          nice: true,
        }),
      [margin.top, innerHeight],
    )

    // tooltip handler
    const handleTooltip = useCallback(
      (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
        const { x } = localPoint(event) || { x: 0 }
        const x0 = dateScale.invert(x)
        const index = bisectDate(stock, x0, 1)
        const d0 = stock[index - 1]
        const d1 = stock[index]
        let d = d0
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: stockValueScale(getStockValue(d)),
        })
      },
      [showTooltip, stockValueScale, dateScale],
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
          <GradientOrangeRed id="area-background-gradient" />
          <LinearGradient id="area-gradient" from={accentColor} to={accentColor} toOpacity={0.1} />
          <GridRows
            left={margin.left}
            scale={stockValueScale}
            width={innerWidth}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0}
            pointerEvents="none"
          />
          <GridColumns
            top={margin.top}
            scale={dateScale}
            height={innerHeight}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0}
            pointerEvents="none"
          />
          <AreaClosed<DailyVolume>
            data={stock}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => stockValueScale(getStockValue(d)) ?? 0}
            yScale={stockValueScale}
            strokeWidth={1}
            stroke="url(#area-gradient)"
            fill="url(#area-gradient)"
            curve={curveMonotoneX}
          />
          <Bar
            x={margin.left}
            y={margin.top}
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
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: innerHeight + margin.top }}
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
                fill={accentColorDark}
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
              {`${formatLamps(getStockValue(tooltipData))} SOL`}
            </TooltipWithBounds>
            <Tooltip
              top={innerHeight + margin.top - 14}
              left={tooltipLeft}
              style={{
                ...defaultStyles,
                minWidth: 72,
                textAlign: 'center',
                transform: 'translateX(-50%)',
              }}
            >
              {formatDate(getDate(tooltipData))}
            </Tooltip>
          </div>
        )}
      </div>
    )
  },
)

export function AreaGraph() {
  return (
    <ParentSize>
      {(parent) => (
        <>
          <_AreaGraph
            width={parent.width}
            height={parent.height}
          />
        </>
      )}
    </ParentSize>
  )
}
