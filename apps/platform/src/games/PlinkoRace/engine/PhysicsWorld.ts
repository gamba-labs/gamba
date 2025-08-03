import Matter, { Composite } from 'matter-js';
import {
  WIDTH,
  HEIGHT,
  PEG_RADIUS,
  BALL_RADIUS,
  GRAVITY,
  RESTITUTION,
  ROWS,
  TIME_SCALE,
  BUCKET_DEFS,
  BUCKET_HEIGHT,
} from './constants';          

export class PhysicsWorld {
  public engine : Matter.Engine;
  public world  : Matter.World;
  private runner: Matter.Runner;

  constructor() {
    /* ── engine ─────────────────────────────────────────── */
    this.engine = Matter.Engine.create({
      gravity: { y: GRAVITY },
      timing : { timeScale: TIME_SCALE  },          // 4× faster than real‑time
    });
    this.runner = Matter.Runner.create({ isFixed: true });
    this.world  = this.engine.world;

    /* ── static geometry (pegs + barriers) ─────────────── */
    Composite.add(this.world, [
      ...this.buildPegs(),
      ...this.buildBarriers(),            // purely for bounce – no sensors
    ]);
  }

  tick(dt = 16) {
    Matter.Runner.tick(this.runner, this.engine, dt);   // one step
  }

  getBodies() {
    return Composite.allBodies(this.world);
  }

  cleanup() {
    Matter.Runner.stop(this.runner);
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
  }

  /* pegs laid out in an equilateral triangular grid */
  private buildPegs() {
    const rowH  = HEIGHT / (ROWS + 2);
    let   pegIx = 0;                                    // <── NEW
    return Array.from({ length: ROWS }).flatMap((_, r, all) => {
      const cols = r + 1;
      const rowW = (WIDTH * r) / (all.length - 1);
      const dx   = cols === 1 ? 0 : rowW / (cols - 1);

      return Array.from({ length: cols }).map((_, c) =>
        Matter.Bodies.circle(
          WIDTH / 2 - rowW / 2 + dx * c,
          rowH * r + rowH / 2,
          PEG_RADIUS,
          {
            isStatic    : true,
            restitution : RESTITUTION,
            label       : 'Peg',
            plugin      : { pegIndex: pegIx++ },         // <── NEW
          },
        )
      );
    }).slice(3);                                        // trim top three rows
  }

  /* barriers between buckets so balls bounce realistically */
  private buildBarriers() {
    const bw = WIDTH / BUCKET_DEFS.length;
    return [0, ...BUCKET_DEFS.map((_, i) => bw * (i + 1))].map(x =>
      Matter.Bodies.rectangle(
        x,
        HEIGHT - BUCKET_HEIGHT / 2,
        4,
        BUCKET_HEIGHT * 1.2,
        { isStatic: true, restitution: RESTITUTION, label: 'Barrier' },
      )
    );
  }
}
