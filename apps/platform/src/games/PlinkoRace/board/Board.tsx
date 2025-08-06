// src/components/Board.tsx
import React, { useMemo, useEffect, useState, useRef } from 'react'
import { GambaUi } from 'gamba-react-ui-v2'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useMultiPlinko } from '../hooks/useMultiPlinko'
import {
  BUCKET_DEFS, BucketType, DYNAMIC_SEQUENCE,
  DYNAMIC_EXTRA_MULT, CENTER_BUCKET,
} from '../engine/constants'
import { PlayerInfo } from '../engine/types'
import BoardHUD, { HudMessage, HudPayload } from './BoardHUD'
import BoardRenderer from './BoardRenderer'
import Scoreboard from './Scoreboard'

import extraBallSnd from '../sounds/extraball.mp3'
import readyGoSnd   from '../sounds/readygo.mp3'

type Particle  = { x:number; y:number; size:number; opacity:number; life:number; vx:number; vy:number }
type LerpState = { px:number; py:number }

export default function Board({
  players,
  winnerIdx,
  metadata = {},
  youIndexOverride,
  gamePk,
  targetPoints = 50,
  payouts,
  onFinished,
}: {
  players: PublicKey[]
  winnerIdx: number | null
  metadata?: Record<string,string>
  youIndexOverride?: number
  gamePk: string
  targetPoints?: number
  payouts?: number[]
  onFinished?: () => void
}) {
  // roster & “you”
  const roster: PlayerInfo[] = useMemo(
    () => players.map((p,i) => ({
      id: p.toBase58(),
      color: ['#ff9aa2','#ffb7b2','#ffdac1','#e2f0cb','#b5ead7','#c7ceea'][i%6],
    })),
    [players]
  )
  const { publicKey } = useWallet()
  const youIdx = useMemo(
    () => youIndexOverride ?? roster.findIndex(r => r.id === publicKey?.toBase58()),
    [roster, publicKey, youIndexOverride]
  )

  // hooks & state
  const { engine, recordRace, replayRace } = useMultiPlinko(roster, gamePk)
  const [scores, setScores]     = useState<number[]>([])
  const [mults,  setMults]      = useState<number[]>([])
  const [dynMode, setDynMode]   = useState(0)
  const [finished, setFinished] = useState(false)
  const [hud, setHud]           = useState<HudPayload|null>(null)

  // always create a fresh payload so HUD animates each time
  const showHud = (text: HudMessage) => {
    setHud({ text, key: Date.now() })
  }

  const bucketAnim = useRef<Record<number,number>>({}).current
  const pegAnim    = useRef<Record<number,number>>({}).current
  const particles  = useRef<Particle[]>([]).current
  const arrowPos   = useRef<Map<number,LerpState>>(new Map()).current
  const labelPos   = useRef<Map<number,LerpState>>(new Map()).current

  const sounds = GambaUi.useSound({
    ready: readyGoSnd,
    extra: extraBallSnd,
  })

  // reset on roster change
  useEffect(() => {
    setScores(Array(roster.length).fill(0))
    setMults (Array(roster.length).fill(1))
    setDynMode(0)
    setFinished(false)
    Object.keys(bucketAnim).forEach(k => bucketAnim[+k] = 0)
    Object.keys(pegAnim   ).forEach(k => pegAnim[+k] = 0)
    particles.length = 0
    arrowPos.clear()
    labelPos.clear()
  }, [roster])

  // finished callback
  useEffect(() => {
    if (finished) onFinished?.()
  }, [finished, onFinished])

  // record + replay + HUD
  useEffect(() => {
    if (!engine || winnerIdx == null) return

    showHud('GO')
    sounds.play('ready')

    const rec = recordRace(winnerIdx, targetPoints)
    const ev  = [...rec.events]
    const runMults = Array(roster.length).fill(1)

    replayRace(rec, frame => {
      while (ev.length && ev[0].frame === frame) {
        const e = ev.shift()!

        if (e.kind === 'bucketMode') {
          setDynMode(e.value ?? 0)
          bucketAnim[CENTER_BUCKET] = 1
          continue
        }

        if (e.bucket !== undefined) {
          const idx = e.bucket
          bucketAnim[idx] = 1

          const def = BUCKET_DEFS[idx]
          const actual = def.type === BucketType.Dynamic
            ? DYNAMIC_SEQUENCE[dynMode]
            : def.type

          if (actual === BucketType.ExtraBall) {
            showHud('EXTRA BALL')
            sounds.play('extra')
          }
        }

        if (e.kind === 'mult') {
          runMults[e.player] = Math.min(runMults[e.player] * (e.value || 1), 64)
          setMults(m => {
            const c = [...m]; c[e.player] = runMults[e.player]; return c
          })
        }

        if (e.kind === 'score') {
          setScores(s => {
            const c = [...s]; c[e.player] += e.value || 0; return c
          })
          runMults[e.player] = 1
          setMults(m => {
            const c = [...m]; c[e.player] = 1; return c
          })
        }

        if (e.kind === 'ballKill') {
          showHud('PLAYER OUT')
        }
      }

      if (frame === rec.totalFrames - 1) {
        setFinished(true)
      }
    })
  }, [engine, winnerIdx, recordRace, replayRace, targetPoints, roster.length])

  // no players case
  if (roster.length === 0 && winnerIdx !== null) {
    return (
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        width:'100%', height:'100%', color:'#fff', background:'#0b0b13'
      }}>
        Game settled with 0 players
      </div>
    )
  }

  return (
    <div style={{ position:'relative', width:'100%', height:'100%' }}>
      <BoardRenderer
        engine={engine}
        dynMode={dynMode}
        bucketAnim={bucketAnim}
        pegAnim={pegAnim}
        particles={particles}
        arrowPos={arrowPos}
        labelPos={labelPos}
        mults={mults}
        roster={roster}
        metadata={metadata}
        youIdx={youIdx}
      />

      <Scoreboard
        roster={roster}
        scores={scores}
        mults={mults}
        targetPoints={targetPoints}
        final={finished}
        payouts={payouts}
        metadata={metadata}
      />

      <BoardHUD message={hud} />
    </div>
  )
}
