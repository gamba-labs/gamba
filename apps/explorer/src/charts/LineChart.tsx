import { curveStep } from "@visx/curve"
import { localPoint } from "@visx/event"
import { ParentSize } from "@visx/responsive"
import { scaleLinear, scaleTime } from "@visx/scale"
import { Area, Bar, Line } from "@visx/shape"
import { withTooltip } from "@visx/tooltip"
import { bisector, extent, max, min } from "@visx/vendor/d3-array"
import React from "react"

// function getRollingAverage(data: LineChartDataPoint[], windowSize: number): number[] {
//   const rollingAverage: number[] = [];

//   for (let i = 0; i < data.length; i++) {
//      const start = Math.max(0, i - windowSize + 1);
//      const end = i + 1;
//      const window = data.slice(start, end);
//      const sum = window.reduce((acc, d) => acc + d.value, 0);
//      const average = sum / window.length;
//      rollingAverage.push(average);
//   }

//   return rollingAverage;
// }

export interface LineChartData {
  data: LineChartDataPoint[]
}

export interface LineChartDataPoint {
  date: string | number
  value: number
}

const getDate = (d: LineChartDataPoint) => new Date(d.date)
const getValue = (d: LineChartDataPoint) => d?.value

const bisectDate = bisector<LineChartDataPoint, Date>(d => new Date(d.date)).left

export type AreaProps = {
  chart: LineChartData
  lineColor?: string
  onHover: (hovered: LineChartDataPoint | null) => void
  width: number
  height: number
  margin?: { top: number; right: number; bottom: number; left: number }
}

const Inner = withTooltip<AreaProps, any>(
  ({
    chart,
    width,
    height,
    margin = { top: 10, right: 0, bottom: 10, left: 0 },
    showTooltip,
    hideTooltip,
    onHover,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
    lineColor = "#ffffff",
  }) => {
    const { data } = chart
    const innerWidth = width - margin.left - margin.right
    const innerHeight = Math.max(1, height - margin.top - margin.bottom)

    const dateScale = React.useMemo(
      () => scaleTime({
        range: [margin.left, innerWidth + margin.left],
        domain: extent(data, getDate) as [Date, Date],
      }),
      [data, innerWidth, margin.left],
    )

    const dataValueScale = React.useMemo(
      () => scaleLinear({
        range: [innerHeight + margin.top, margin.top],
        domain: [
          (min(data, getValue) || 0),
          (max(data, getValue) || 0),
        ],
        nice: true,
      }),
      [data, getValue, margin.top, innerHeight],
    )

    const handleTooltip = React.useCallback(
      (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
        const { x } = localPoint(event) || { x: 0 }
        const x0 = dateScale.invert(x)
        const index = bisectDate(data, x0, 1)
        const d0 = data[index - 1]
        const d1 = data[index]
        let d = d0
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0
        }
        onHover(d)
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: dataValueScale(getValue(d)),
        })
      },
      [data, showTooltip, dataValueScale, dateScale],
    )

    const mouseLeave = () => {
      hideTooltip()
      onHover(null)
    }

    return (
      <div>
        <svg width={width} height={height}>
          <Area
            data={data}
            x={d => dateScale(getDate(d)) ?? 0}
            y={d => dataValueScale(getValue(d)) ?? 0}
            strokeWidth={2}
            stroke={lineColor}
            curve={curveStep}
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
            onMouseLeave={mouseLeave}
          />
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                stroke={lineColor}
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="5,2"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={4}
                fill={lineColor}
                stroke="white"
                strokeWidth={1}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
      </div>
    )
  },
)

export function LineChart<T>(props: Omit<AreaProps, "width" | "height">) {
  return (
    <ParentSize debounceTime={250}>
      {parent => (
        <Inner
          {...props}
          width={parent.width}
          height={parent.height}
        />
      )}
    </ParentSize>
  )
}
