import React from 'react'
import styles from './styles.module.css'

interface SliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  resultIndex: number
  disabled?: boolean
}

const Slider: React.FC<SliderProps> = ({ min, max, value, onChange, resultIndex, disabled }) => {
  const labels = Array.from({ length: 5 }).map((_, i, arr) => min + Math.floor(i / (arr.length - 1) * (max - min)))
  const [isDragging, setIsDragging] = React.useState(false)

  const track = React.useRef<HTMLDivElement>(null!)

  const handleDragStart = () => {
    if (disabled) return
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDrag = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || disabled) return
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const { width, left } = track.current.getBoundingClientRect()
    const xx = Math.min(1, Math.max(0, (clientX - left) / width))
    onChange(
      Math.max(min, Math.min(max, Math.round(xx * max))),
    )
  }

  return (
    <div
      className={styles.sliderContainer}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onMouseMove={handleDrag}
    >
      {resultIndex > -1 &&
        <div key={resultIndex} className={styles.result} style={{ left: `${resultIndex}%` }}>
          {resultIndex}
        </div>
      }
      <div ref={track} className={styles.slider}>
        <div style={{ width: `${value / max * 100}%` }} />
      </div>
      {labels.map((label, i) => (
        <div
          key={i}
          className={styles.label}
          style={{ left: (label / max * 100) + '%' }}
        >
          {label}
        </div>
      ))}
    </div>
  )
}

export default Slider
