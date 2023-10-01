import { localPoint } from '@visx/event'
import { LinearGradient } from '@visx/gradient'
import { Group } from '@visx/group'
import { ParentSize } from '@visx/responsive'
import { scaleLinear, scaleTime } from '@visx/scale'
import { Bar } from '@visx/shape'
import { extent } from '@visx/vendor/d3-array'
import React from 'react'
import { DailyVolume } from './data'

// accessors
const getDate = (d: DailyVolume) => new Date(d.date)
const getDailyVolume = (d: DailyVolume) => d.total_volume

export type AreaProps = {
  width: number
  height: number
  dailyVolume: DailyVolume[]
  onHover: (hovered: DailyVolume | null) => void
};

const unixDay = (time: number) => time / (1000 * 3600 * 24)

const _Graph = ({ width, height, dailyVolume: _dailyVolume, onHover }: AreaProps) => {
  const [hoveredBar, setHoveredBar] = React.useState<DailyVolume | null>(null)

  const dailyVolume = React.useMemo<DailyVolume[]>(
    () => {
      const [date1, date2] = extent(_dailyVolume, getDate)
      if (!date1 || !date2) return []
      const days = 1 + unixDay(date2.getTime() - date1.getTime())
      const volumeByDay = _dailyVolume.reduce((prev, x) => ({
        ...prev,
        [new Date(x.date).toString()]: x.total_volume
      }), {} as Record<string, number>)

      return Array.from({length: days}).map((_, dayIndex) => {
        const startDate = new Date(date1)
        const date = new Date(startDate.setDate(startDate.getDate() + dayIndex))
        return {
          total_volume: volumeByDay[date.toString()] ?? 0,
          date: date.toString()
        }
      })
    },
    [_dailyVolume]
  )

  const barMargin = Math.min(4, width * .8)
  const barWidth = (width) / (dailyVolume.length);

  const xScale = React.useMemo(
    () =>
      scaleTime({
        range: [0, width - barWidth],
        domain: extent(dailyVolume, getDate) as [Date, Date],
      }),
    [dailyVolume, width],
  )

  const yScale = React.useMemo(
    () =>
      scaleLinear<number>({
        range: [height, 0],
        round: true,
        domain: [0, Math.max(...dailyVolume.map(getDailyVolume))],
      }),
    [dailyVolume, height],
  )

  const handleTooltip = React.useCallback((event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
    const { x } = localPoint(event) || { x: 0 }
    const index = Math.floor(x / barWidth)
    if (index >= 0 && index < dailyVolume.length) {
      onHover(dailyVolume[index])
      setHoveredBar(dailyVolume[index])
    } else {
      onHover(null)
      setHoveredBar(null)
    }
  }, [dailyVolume, barWidth, onHover, setHoveredBar])

  const hideTooltip = () => {
    onHover(null)
    setHoveredBar(null)
  }

  return (
    <div>
      <svg width={width} height={height}>
        <LinearGradient
          id="area-gradient"
          from="#ff6562"
          to="#ff255b"
          toOpacity={1}
        />
        <Bar
          width={width}
          height={height}
          fill="transparent"
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={hideTooltip}
        />
        <Group>
          {dailyVolume.map((d, i) => {
            const barHeight = (height - (yScale(getDailyVolume(d)) ?? 0))*.95
            const barX = xScale(getDate(d)) + barMargin / 2
            const barY = height - barHeight
            const isHovered = d === hoveredBar
            return (
              <g pointerEvents="none" key={`bar-group-${d.date}`}>
                {isHovered && (
                  <Bar
                    x={barX}
                    y={0}
                    width={barWidth - barMargin}
                    height={height}
                    fill="white"
                    opacity={.1}
                  />
                )}
                <Bar
                  x={barX}
                  y={barY}
                  width={barWidth - barMargin}
                  height={barHeight}
                  fill="url(#area-gradient)"
                  rx={4}
                />
              </g>
            )
          })}
        </Group>
      </svg>
    </div>
  )
}

export function Graph(props: Omit<AreaProps, 'width' | 'height'>) {
  return (
    <ParentSize>
      {(parent) => (
        <_Graph
          {...props}
          width={parent.width}
          height={parent.height}
        />
      )}
    </ParentSize>
  )
}
