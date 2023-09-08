import React from 'react'
import styles from './Slider.module.css'

interface SliderProps {
  min: number
  max: number
  value: number
  range: [number, number]
  onChange: (value: number) => void
  disabled?: boolean
}

const Slider: React.FC<SliderProps> = ({ min: minValue, max: maxValue, value, onChange, disabled, range: [min, max] }) => {
  const labels = Array.from({ length: 5 }).map((_, i, arr) => min + Math.floor(i / (arr.length - 1) * (max - min)))
  const [isDragging, setIsDragging] = React.useState(false)
  const track = React.useRef<HTMLDivElement>(null!)

  const change = (clientX: number) => {
    if (disabled) return
    const { width, left } = track.current.getBoundingClientRect()
    const xx = Math.min(1, Math.max(0, (clientX - left) / width))
    const newValue = Math.max(minValue, Math.min(maxValue, Math.round(xx * max)))
    if (newValue !== value)
      onChange(newValue)
  }

  const handleDragStart = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    setIsDragging(true)
    change(clientX)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDrag = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    change(clientX)
  }

  return (
    <div
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onMouseMove={handleDrag}
    >
      <div ref={track} className={styles.slider} aria-disabled={disabled}>
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
