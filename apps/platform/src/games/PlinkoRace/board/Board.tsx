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
import { makeRng } from '../engine/deterministic'

import extraBallSnd from '../sounds/extraball.mp3'
import readyGoSnd   from '../sounds/readygo.mp3'
import fallSnd      from '../sounds/fall.mp3'
import bigComboSnd  from '../sounds/bigcombo.mp3'
import finishSnd    from '../sounds/finsh.mp3'

type Particle  = { x:number; y:number; size:number; opacity:number; life:number; vx:number; vy:number }
type LerpState = { px:number; py:number }

export default function Board({
  players,
  winnerIdx,
  metadata = {},
  youIndexOverride,
  gamePk,
  targetPoints = 100,
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
  const [dynModes, setDynModes] = useState<number[]>([])
  const [started, setStarted]   = useState(false)
  const [patternOffsets, setPatternOffsets] = useState<number[]>([])
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

  const { play, sounds } = GambaUi.useSound({
    ready: readyGoSnd,
    extra: extraBallSnd,
    fall : fallSnd,
    finish: finishSnd,
    bigcombo: bigComboSnd,
  })

  // throttle frequent SFX like fall
  const lastFallMsRef = useRef(0)

  // reset on roster change
  useEffect(() => {
    setScores(Array(roster.length).fill(0))
    setMults (Array(roster.length).fill(1))
    setDynModes([])
    setStarted(false)
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
    if (sounds.ready?.ready) play('ready')
    setStarted(true)

    const rec = recordRace(winnerIdx, targetPoints)
    const ev  = [...rec.events]
    const runMults = Array(roster.length).fill(1)

    replayRace(rec, frame => {
      while (ev.length && ev[0].frame === frame) {
        const e = ev.shift()!

        if (e.kind === 'bucketMode') {
          // record per-bucket dyn mode
          setDynModes(m => {
            const next = [...(m.length ? m : Array(BUCKET_DEFS.length).fill(0))]
            if (e.bucket !== undefined) next[e.bucket] = e.value ?? 0
            else BUCKET_DEFS.forEach((b,i)=>{ if(b.type===BucketType.Dynamic) next[i]=e.value??0 })
            return next
          })

          // animate the affected dynamic bucket(s)
          if (e.bucket !== undefined) {
            bucketAnim[e.bucket] = 1
          } else {
            BUCKET_DEFS.forEach((b, i) => {
              if (b.type === BucketType.Dynamic) bucketAnim[i] = 1
            })
          }
          continue
        }

        // receive deterministic per-bucket pattern offset
        if (e.kind === 'bucketPattern' && e.bucket !== undefined) {
          setPatternOffsets(arr => {
            const dynIdxs = BUCKET_DEFS
              .map((b,i)=> b.type===BucketType.Dynamic ? i : -1)
              .filter(i=>i>=0)
            const mapIndex = dynIdxs.indexOf(e.bucket!)
            const next = [...(arr.length ? arr : Array(dynIdxs.length).fill(0))]
            if (mapIndex >= 0) next[mapIndex] = e.value ?? 0
            return next
          })
          continue
        }

        if (e.bucket !== undefined) {
          const idx = e.bucket
          bucketAnim[idx] = 1
          const now = performance.now()
          if (sounds.fall?.ready && now - lastFallMsRef.current > 60) {
            lastFallMsRef.current = now
            play('fall')
          }

          // handle explicit extraBall event without relying on dynMode closure
          if (e.kind === 'extraBall') {
            showHud('EXTRA BALL')
            if (sounds.extra?.ready) play('extra')
          }

          const def = BUCKET_DEFS[idx]
          const mode = dynModes[idx] ?? 0
          const actual = def.type === BucketType.Dynamic
            ? DYNAMIC_SEQUENCE[mode]
            : def.type

          // keep legacy path for static ExtraBall buckets
          if (actual === BucketType.ExtraBall && e.kind !== 'extraBall') {
            showHud('EXTRA BALL')
            if (sounds.extra?.ready) play('extra')
          }
        }

        if (e.kind === 'mult') {
          const inc = e.value || 1
          const curr = runMults[e.player]
          runMults[e.player] = Math.min((curr === 1 ? 0 : curr) + inc, 64)
          setMults(m => {
            const c = [...m]; c[e.player] = runMults[e.player]; return c
          })

          // BIG COMBO trigger when multiplier reaches 5x or more
          if (runMults[e.player] >= 5) {
            showHud('BIG COMBO')
            if (sounds.bigcombo?.ready) play('bigcombo')
          }
        }

        if (e.kind === 'deduct') {
          showHud('DEDUCTION')
          setScores(s => {
            const c = [...s];
            c[e.player] = Math.max(0, (c[e.player] ?? 0) - (e.value || 0));
            return c
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
        if (sounds.finish?.ready) play('finish')
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
        dynModes={dynModes}
        patternOffsets={patternOffsets}
        started={started}
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
