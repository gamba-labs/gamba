import React from "react"
import { GambaUi } from "."
import useAnimationFrame from "./hooks/useAnimationFrame"

export function EffectTest({src}: {src: string}) {
  const parts = React.useRef(Array.from({length: 25}).map(() => ({
    x: Math.random(),
    y: -Math.random() * 600,
  })))

  const image = React.useMemo(
    () => {
      const image = document.createElement('img')
      image.src = src
      return image
    },
    [src]
  )

  useAnimationFrame(
    () => {
      parts.current.forEach(
        (part, i) => {
          const speed = (1 + Math.sin(i * 44213.3) * .1) * 5
          part.y += speed
        }
      )
    }
  )

  return (
    <GambaUi.Canvas
      zIndex={99}
      style={{pointerEvents: 'none'}}
      render={(c, ctx, time, {width, height}) => {
        ctx.save()
        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = '#00000011'
        ctx.fillRect(0, 0, width, height)

        ctx.font = '30px arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#22ff11'
        parts.current.forEach(
          (part, i) => {
            ctx.save()
            ctx.translate(part.x * width, height - (part.y) - 25)
            ctx.scale(.5, .5)
            ctx.drawImage(image, 0, 0)
            ctx.restore()
          }
        )
        ctx.restore()
      }}
    />
  )
}

export function EffectTest2() {
  return (
    <GambaUi.Canvas
      style={{pointerEvents: 'none'}}
      zIndex={99}
      render={(c, ctx, time, {width, height}) => {
        ctx.save()
        ctx.clearRect(0, 0, width, height)

        ctx.font = '30px arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#eaffe9cc'
        for (let i = 25; i--;) {
          const speed = (1 + Math.sin(i * 44213.3) / 2) * 100
          const y = (time.time * speed + Math.cos(i * 4213.3) * height * 2)
          ctx.save()
          ctx.translate(i / 25 * width + Math.cos(time.time + i * 4.444) * 20, height - (y % (height + 50)) - 25)
          ctx.scale(.5, .5)
          ctx.beginPath()
          ctx.arc(0, 0, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
        ctx.fillText("WINNER", width / 2, height / 2)
        ctx.restore()
      }}
    />
  )
}
