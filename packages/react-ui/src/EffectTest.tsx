import React from 'react'
import { GambaUi } from '.'
import useAnimationFrame from './hooks/useAnimationFrame'

export function EffectTest({ src }: {src: string}) {
  const parts = React.useRef(Array.from({ length: 25 }).map(() => ({
    x: Math.random(),
    y: -Math.random() * 600,
  })))

  const image = React.useMemo(
    () => {
      const image = document.createElement('img')
      image.src = src
      return image
    },
    [src],
  )

  useAnimationFrame(
    () => {
      parts.current.forEach(
        (part, i) => {
          const speed = (1 + Math.sin(i * 44213.3) * .1) * 5
          part.y += speed
        },
      )
    },
  )

  return (
    <GambaUi.Canvas
      zIndex={99}
      style={{ pointerEvents: 'none' }}
      render={({ ctx, size }, clock) => {
        ctx.save()
        ctx.clearRect(0, 0, size.width, size.height)
        ctx.fillStyle = '#00000011'
        ctx.fillRect(0, 0, size.width, size.height)

        ctx.font = '30px arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#22ff11'
        parts.current.forEach(
          (part, i) => {
            ctx.save()
            ctx.translate(part.x * size.width, size.height - (part.y) - 25)
            ctx.scale(.5, .5)
            ctx.drawImage(image, 0, 0)
            ctx.restore()
          },
        )
        ctx.restore()
      }}
    />
  )
}
