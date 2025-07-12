import Matter from 'matter-js'

// --- constants -----------------------------------------------------------
export const WIDTH = 700
export const HEIGHT = 700
export const GRAVITY = 1

export const PLINKO_RADIUS = 9
export const PEG_RADIUS = 11
export const REST = 0.4

export const bucketHeight = 60
export const barrierHeight = bucketHeight * 1.2
export const barrierWidth = 4

// -------------------------------------------------------------------------
interface Props {
  rows: number
  teamColors: string[]
  onPeg(): void
  /**
   * bucketMultiplier:
   *   >1  = multiplier bucket (e.g. 1.5, 2, 3)
   *    0  = dead zone
   *   <0  = score bucket (–5 ⇒ 5 pts, –10 ⇒ 10 pts)
   * bucketIndex: 0–12
   */
  onBucket(teamIndex: number, bucketMultiplier: number, bucketIndex: number): void
}

// -------------------------------------------------------------------------
export class PlinkoGame {
  width = WIDTH
  height = HEIGHT

  private engine = Matter.Engine.create({ gravity: { y: GRAVITY } })
  private runner = Matter.Runner.create()
  private ballLayer = Matter.Composite.create()
  private props: Props
  private running = false

  constructor(props: Props) {
    this.props = props
    this.buildStatic()
    this.run()
  }

  run() {
    if (!this.running) {
      Matter.Runner.run(this.runner, this.engine)
      this.running = true
    }
  }

  stop() {
    if (this.running) {
      Matter.Runner.stop(this.runner)
      this.running = false
    }
  }

  reset() {
    Matter.Composite.clear(this.ballLayer, false)
  }

  spawnTeams(countPerTeam: number) {
    for (let t = 0; t < this.props.teamColors.length; t++) {
      for (let i = 0; i < countPerTeam; i++) {
        this.spawnBall(t, WIDTH / 2, -40 - t * 10)
      }
    }
  }

  getBodies() {
    return Matter.Composite.allBodies(this.engine.world)
  }

  private spawnBall(team: number, x: number, y: number) {
    const ball = Matter.Bodies.circle(x, y, PLINKO_RADIUS, {
      label: 'Ball',
      restitution: REST,
      plugin: { colorIndex: team },
    })
    Matter.Composite.add(this.ballLayer, ball)
  }

  private buildStatic() {
    const { rows } = this.props
    const world = this.engine.world

    // --- Pegs (pyramid) ---
    const rowSize = this.height / (rows + 2)
    const pegs = Array.from({ length: rows })
      .flatMap((_, row, allRows) => {
        const cols = row + 1
        const rowWidth = this.width * (row / (allRows.length - 1))
        const spacing = cols === 1 ? 0 : rowWidth / (cols - 1)
        return Array.from({ length: cols }).map((_, col) => {
          const x = this.width / 2 - rowWidth / 2 + spacing * col
          const y = rowSize * row + rowSize / 2
          return Matter.Bodies.circle(x, y, PEG_RADIUS, {
            isStatic: true,
            label: 'Peg',
          })
        })
      })
      .slice(1)

    // --- 13 Buckets: [3×,10,2×,5,1.5×,2,0,2,1.5×,5,2×,10,3×] ---
    const defs = [3, -10, 2, -5, 1.5, -2, 0, -2, 1.5, -5, 2, -10, 3]
    const bucketWidth = WIDTH / defs.length
    const buckets = defs.map((bm, i) => {
      const cx = bucketWidth * i + bucketWidth / 2
      return Matter.Bodies.rectangle(
        cx,
        HEIGHT - bucketHeight / 2,
        bucketWidth - barrierWidth,
        bucketHeight,
        {
          isStatic: true,
          isSensor: true,
          label: 'Bucket',
          plugin: {
            bucketMultiplier: bm,
            bucketIndex: i,
          },
        }
      )
    })

    // --- Barriers ---
    const barriers = [0, ...defs.map((_, i) => bucketWidth * (i + 1))].map((x) =>
      Matter.Bodies.rectangle(x, HEIGHT - barrierHeight / 2, barrierWidth, barrierHeight, {
        isStatic: true,
        label: 'Barrier',
      })
    )

    Matter.Composite.add(world, [...pegs, ...buckets, ...barriers, this.ballLayer])

    // --- Collisions ---
    Matter.Events.on(this.engine, 'collisionStart', (ev) => {
      for (const { bodyA, bodyB } of ev.pairs) {
        // peg hit
        if (
          (bodyA.label === 'Peg' && bodyB.label === 'Ball') ||
          (bodyB.label === 'Peg' && bodyA.label === 'Ball')
        ) {
          this.props.onPeg()
        }

        // bucket hit
        const bucket =
          bodyA.label === 'Bucket'
            ? (bodyA as Matter.Body & { plugin: any })
            : bodyB.label === 'Bucket'
            ? (bodyB as Matter.Body & { plugin: any })
            : null
        const ball =
          bucket === bodyA
            ? (bodyB as Matter.Body & { plugin: any })
            : bucket === bodyB
            ? (bodyA as Matter.Body & { plugin: any })
            : null

        if (bucket && ball) {
          const team = ball.plugin.colorIndex as number
          const bm = bucket.plugin.bucketMultiplier as number
          const idx = bucket.plugin.bucketIndex as number
          this.props.onBucket(team, bm, idx)

          Matter.Composite.remove(this.ballLayer, ball)
          this.spawnBall(team, WIDTH / 2, -40 - team * 10)
        }
      }
    })
  }
}
