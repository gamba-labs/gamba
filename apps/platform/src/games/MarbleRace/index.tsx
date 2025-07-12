import React from 'react'
import { GambaUi, useSound } from 'gamba-react-ui-v2'
import { Scoreboard } from './Scoreboard'
import {
  PlinkoGame,
  PEG_RADIUS,
  PLINKO_RADIUS,
  bucketHeight,
  barrierHeight,
  barrierWidth,
} from './game'

import BUMP from './bump.mp3'
import LAND from './fall.mp3'

const TEAM_COLORS = ['#e44', '#48e', '#3c3', '#fc3']

export default function PlinkoRace() {
  const [scores, setScores] = React.useState(TEAM_COLORS.map(() => 0))
  const [multis, setMultis] = React.useState(TEAM_COLORS.map(() => 1))
  const multisRef = React.useRef(multis)
  const [highlight, setHighlight] = React.useState<Set<number>>(new Set())
  const [winner, setWinner] = React.useState<number | null>(null)
  const [debug, setDebug] = React.useState(false)

  const sounds = useSound({ bump: BUMP, land: LAND })

  const plinko = React.useMemo(
    () =>
      new PlinkoGame({
        rows: 13,
        teamColors: TEAM_COLORS,
        onPeg: () =>
          sounds.play('bump', { playbackRate: 0.9 + Math.random() * 0.2 }),
        onBucket: (team, bm, idx) => {
          if (winner !== null) return

          // highlight bucket
          setHighlight((h) => {
            const n = new Set(h)
            n.add(idx)
            return n
          })
          setTimeout(() => {
            setHighlight((h) => {
              const n = new Set(h)
              n.delete(idx)
              return n
            })
          }, 400)

          if (bm > 1) {
            // multiplier
            setMultis((prev) => {
              const next = [...prev]
              next[team] = Math.min(next[team] * bm, 64)
              multisRef.current = next
              return next
            })
          } else if (bm < 0) {
            // score: (–bm) × current multiplier
            const pts = -bm * multisRef.current[team]
            setScores((prev) => {
              const next = [...prev]
              next[team] += pts
              return next
            })
            setMultis((prev) => {
              const next = [...prev]
              next[team] = 1
              multisRef.current = next
              return next
            })
          }
          // bm === 0 → dead

          sounds.play('land')
        },
      }),
    []
  )

  React.useEffect(() => {
    multisRef.current = multis
  }, [multis])

  React.useEffect(() => {
    scores.forEach((s, i) => {
      if (s >= 100 && winner === null) {
        setWinner(i)
        plinko.stop()
      }
    })
  }, [scores, winner])

  const start = () => {
    setScores(TEAM_COLORS.map(() => 0))
    setMultis(TEAM_COLORS.map(() => 1))
    multisRef.current = TEAM_COLORS.map(() => 1)
    setWinner(null)
    plinko.reset()
    plinko.spawnTeams(1)
    plinko.run()
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <Scoreboard
          scores={scores}
          multis={multis}
          shaking={new Set()}
          colors={TEAM_COLORS}
        />

        <GambaUi.Canvas
          render={({ ctx, size }) => {
            if (!plinko) return
            const scale = Math.min(
              size.width / plinko.width,
              size.height / plinko.height
            )
            ctx.clearRect(0, 0, size.width, size.height)
            ctx.fillStyle = '#0b0b13'
            ctx.fillRect(0, 0, size.width, size.height)
            ctx.save()
            ctx.translate(
              size.width / 2 - (plinko.width * scale) / 2,
              size.height / 2 - (plinko.height * scale) / 2
            )
            ctx.scale(scale, scale)

            for (const body of plinko.getBodies()) {
              const { label, position: p } = body

              if (debug && body.vertices) {
                ctx.beginPath()
                ctx.moveTo(body.vertices[0].x, body.vertices[0].y)
                for (let i = 1; i < body.vertices.length; i++) {
                  ctx.lineTo(body.vertices[i].x, body.vertices[i].y)
                }
                ctx.closePath()
                ctx.lineWidth = 1
                ctx.strokeStyle = '#ffffff55'
                ctx.stroke()
              }

              if (label === 'Peg') {
                ctx.beginPath()
                ctx.arc(p.x, p.y, PEG_RADIUS, 0, Math.PI * 2)
                ctx.fillStyle = '#999'
                ctx.fill()
              }

              if (label === 'Ball') {
                const team = body.plugin.colorIndex as number
                const glow = 6 * Math.sqrt(multisRef.current[team])
                ctx.save()
                ctx.shadowColor = TEAM_COLORS[team]
                ctx.shadowBlur = glow
                ctx.beginPath()
                ctx.arc(p.x, p.y, PLINKO_RADIUS, 0, Math.PI * 2)
                ctx.fillStyle = TEAM_COLORS[team]
                ctx.fill()
                ctx.restore()
              }

              if (label === 'Bucket') {
                const bm = body.plugin.bucketMultiplier as number
                const idx = body.plugin.bucketIndex as number

                if (highlight.has(idx)) {
                  ctx.save()
                  ctx.shadowColor = '#fff'
                  ctx.shadowBlur = 30
                }

                // bucket background
                if (bm > 1) ctx.fillStyle = 'rgba(30,200,30,0.6)'
                else if (bm < 0) ctx.fillStyle = 'rgba(30,30,200,0.6)'
                else ctx.fillStyle = 'rgba(50,50,50,0.6)'

                const x0 = body.bounds.min.x
                const w = body.bounds.max.x - body.bounds.min.x
                ctx.fillRect(x0, p.y - bucketHeight / 2, w, bucketHeight)

                // label in white
                ctx.font = `bold ${bucketHeight * 0.4}px sans-serif`
                ctx.fillStyle = '#fff'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                let text: string
                if (bm > 1) text = `${bm}×`
                else if (bm < 0) text = `${-bm}`
                else text = '—'
                ctx.fillText(text, x0 + w / 2, p.y)

                if (highlight.has(idx)) ctx.restore()
              }

              if (label === 'Barrier') {
                ctx.fillStyle = '#6665'
                ctx.fillRect(
                  p.x - barrierWidth / 2,
                  p.y - barrierHeight / 2,
                  barrierWidth,
                  barrierHeight
                )
              }
            }
            ctx.restore()

            if (winner !== null) {
              ctx.font = 'bold 48px sans-serif'
              ctx.fillStyle = TEAM_COLORS[winner]
              ctx.textAlign = 'center'
              ctx.fillText(
                `Team ${winner + 1} wins!`,
                size.width / 2,
                size.height / 2
              )
            }
          }}
        />
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <GambaUi.Button onClick={start}>Start Game</GambaUi.Button>
          <GambaUi.Switch checked={debug} onChange={setDebug} />
        </div>
      </GambaUi.Portal>
    </>
  )
}
