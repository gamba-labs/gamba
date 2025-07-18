import Matter, { Composite } from 'matter-js'

/* ─── board size & constants ────────────────────────────────── */
export const WIDTH  = 700
export const HEIGHT = 700

export const PEG_RADIUS    = 11
export const BALL_RADIUS   = 9

const RESTITUTION = 0.4
const GRAVITY     = 1
const STEP_MS     = 16
const MAX_FRAMES  = 8_000        // 128 s of sim time

/* bottom threshold (same as single‑player) */
const BOTTOM_Y = HEIGHT + BALL_RADIUS

/* ─── exported types ─────────────────────────────────────────── */
export interface PlayerInfo { id: string; color: string }
export interface RecordedRace {
  winnerIndex : number
  paths       : Float32Array[]           // one per player
  offsets     : number[]                 // x‑offset used per player
}

/* ─── core engine ───────────────────────────────────────────── */
export class MultiPlinko {
  readonly engine = Matter.Engine.create({
    gravity:{ y: GRAVITY },
    timing :{ timeScale: 1 },
  })
  readonly runner = Matter.Runner.create({ isFixed:true })

  private rows      : number
  private players   : PlayerInfo[]
  private simBalls  = Composite.create()

  constructor(rows:number, players:PlayerInfo[]){
    this.rows    = rows
    this.players = players

    Composite.add(this.engine.world, [
      ...this.buildPegs(),
      this.simBalls,
    ])
  }

  cleanup(){
    Matter.Runner.stop(this.runner)
    Matter.World.clear(this.engine.world,false)
    Matter.Engine.clear(this.engine)
  }

  /* ─────────── simulation (always succeeds) ─────────── */

  recordRace(winnerIdx:number): RecordedRace {
    const WIN = Math.max(0, Math.min(this.players.length-1, winnerIdx))

    /* try up to 40 random offset sets (±8 px) */
    for (let attempt=0; attempt<40; attempt++){
      const offsets = this.players.map(() => Matter.Common.random(-8, 8))
      const res = this.runAttempt(offsets, WIN)
      if (res) {
        res.offsets = offsets
        return res
      }
    }

    /* extremely unlikely fallback: give winner huge offset */
    const fallbackOffsets = this.players.map((_,i)=>
      i===WIN ? Matter.Common.random(-40,40) : 0
    )
    return this.runAttempt(fallbackOffsets, WIN)!
  }

  /* ─────────── replay visualisation ─────────── */

  replayRace(rec:RecordedRace){
    Composite.clear(this.simBalls,false)
    Matter.Runner.stop(this.runner)

    /* spawn static bodies for replay */
    const bodies = this.players.map((_,i)=>{
      const body = this.makeBall(i, -999)
      Matter.Body.setStatic(body,true)
      Composite.add(this.simBalls, body)
      return body
    })

    const totalFrames = rec.paths[0].length / 2   // all equal length
    let frame = 0
    const raf = ()=>{
      // warp each ball this frame
      bodies.forEach((b,i)=>{
        const path = rec.paths[i]
        const idx  = Math.min(frame, path.length/2 - 1)
        const x = path[idx*2], y = path[idx*2+1]
        Matter.Body.setPosition(b,{x,y})
      })
      frame++
      if (frame < totalFrames) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }

  /* ───────── attempt helper ───────── */

  private runAttempt(offsets:number[], winner:number): RecordedRace | null {
    Composite.clear(this.simBalls,false)
    Matter.Runner.stop(this.runner)

    /* spawn balls with offsets */
    const bodies = this.players.map((_,i)=>{
      const b = this.makeBall(i)
      Matter.Body.setPosition(b,{ x:WIDTH/2 + offsets[i], y:-10 })
      Composite.add(this.simBalls,b)
      return b
    })

    const finishedAt = Array(this.players.length).fill(-1)
    const paths      = this.players.map(()=>[] as number[])

    for (let frame=0; frame<MAX_FRAMES; frame++){
      Matter.Runner.tick(this.runner,this.engine,STEP_MS)

      bodies.forEach((b,i)=>{
        paths[i].push(b.position.x, b.position.y)
        if (finishedAt[i]===-1 && b.position.y >= BOTTOM_Y){
          finishedAt[i] = frame
        }
      })

      if (finishedAt.every(t=>t!==-1)){
        if (finishedAt[winner] <= Math.min(...finishedAt.filter((_,i)=>i!==winner))){
          return {
            winnerIndex: winner,
            paths: paths.map(arr=>new Float32Array(arr)),
            offsets: offsets,         // filled by caller
          }
        }
        return null                     // winner not first → discard
      }
    }
    return null                         // timeout (shouldn’t happen)
  }

  /* ───────── geometry helpers ───────── */

  private buildPegs(){
    const rowH = HEIGHT/(this.rows+2)
    return Array.from({length:this.rows}).flatMap((_,r,all)=>{
      const cols = r+1
      const rowW = WIDTH*r/(all.length-1)
      const dx   = cols===1?0:rowW/(cols-1)
      return Array.from({length:cols}).map((_,c)=>{
        const x = WIDTH/2 - rowW/2 + dx*c
        const y = rowH*r + rowH/2
        return Matter.Bodies.circle(x,y,PEG_RADIUS,{ isStatic:true,label:'Peg'})
      })
    }).slice(1)
  }

  private makeBall(idx: number) {
    return Matter.Bodies.circle(
      WIDTH/2,      // x
      -10,          // y (just above top)
      BALL_RADIUS,  // radius
      {
        restitution: RESTITUTION,
        collisionFilter: {
          // NEGATIVE group disables collisions between any two bodies
          // created with the same group value
          group: -1
        },
        label: 'Ball',
        plugin: { playerIndex: idx },
      }
    )
  }
}
