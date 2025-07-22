// src/engine/SimulationEngine.ts
import Matter, { Composite, Bodies, Body } from 'matter-js';
import { PhysicsWorld, WIDTH, HEIGHT, BALL_RADIUS } from './PhysicsWorld';
import { PlayerInfo, RecordedRace }               from './types';
import { makeRng }                                from './deterministic';

const MAX_FRAMES       = 200_000;
const MAX_ATTEMPTS     = 60;
const POINTS_PER_CROSS = 50;

export class SimulationEngine {
  private rows        : number;
  private players     : PlayerInfo[];

  /** Static world for pegs (always present) */
  private staticWorld : PhysicsWorld;

  /** Reel-in world for replaying the final run */
  private replayWorld ?: PhysicsWorld;

  /** Deterministic PRNG (0..1) */
  private rng         : () => number;

  /**
   * @param rows     number of plinko rows
   * @param players  roster with id/color
   * @param gamePk   the Base-58 game address to seed RNG (optional)
   */
  constructor(rows: number, players: PlayerInfo[], gamePk?: string) {
    this.rows    = rows;
    this.players = players;

    // build peg world immediately
    this.staticWorld = new PhysicsWorld(rows);

    // deterministic RNG from gamePk, or fallback to Math.random
    this.rng = gamePk ? makeRng(gamePk) : () => Math.random();
  }

  /**
   * Keep trying random-offset runs until ONLY `winnerIndex`
   * is first to reach `targetPoints`. Guaranteed to return a valid race.
   */
  recordRace(
    winnerIndex: number,
    targetPoints = 100
  ): RecordedRace {
    const W = Math.max(0, Math.min(this.players.length - 1, winnerIndex));

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const rec = this.runSingleAttempt(W, targetPoints);
      if (rec) {
        console.log(
          `[SimulationEngine] SUCCESS: winner ${W} in attempt ${attempt}`
        );
        return rec;
      }
      console.log(`[SimulationEngine] attempt ${attempt} rejected`);
    }

    throw new Error(
      `SimulationEngine: no valid run for winner ${W} after ${MAX_ATTEMPTS}`
    );
  }

  /** Single continuous sim: spawn, tick, respawn, score until winner reaches target. */
  private runSingleAttempt(
    winIdx: number,
    targetPoints: number
  ): RecordedRace | null {
    // local sim world (so we don’t pollute staticWorld)
    const world     = new PhysicsWorld(this.rows);
    const ballLayer = Composite.create();
    Composite.add(world.world, ballLayer);

    // deterministic spawn X offsets: -8..+8 px
    const spawnXs = this.players.map(() => WIDTH/2 + (this.rng()*16 - 8));

    // spawn dynamic balls
    const bodies: Body[] = spawnXs.map((x,i) =>
      Bodies.circle(x, -10, BALL_RADIUS, {
        restitution: 0.4,
        collisionFilter: { group: -1 },
        label: 'Ball',
        plugin: { playerIndex: i },
      })
    );
    Composite.add(ballLayer, bodies);

    // recorders
    const paths     = this.players.map(() => [] as number[]);
    const crossings = this.players.map(() => [] as number[]);
    const scores    = Array(this.players.length).fill(0);
    let winnerThisRun: number | null = null;

    for (let frame = 0; frame < MAX_FRAMES; frame++) {
      world.tick(16);

      const justScored: number[] = [];
      bodies.forEach((b,i) => {
        paths[i].push(b.position.x, b.position.y);
        if (b.position.y >= HEIGHT + BALL_RADIUS) {
          scores[i] += POINTS_PER_CROSS;
          crossings[i].push(frame);
          justScored.push(i);
          // immediate respawn
          Body.setPosition(b, { x: spawnXs[i], y: -10 });
          Body.setVelocity(b, { x: 0, y: 0 });
        }
      });

      // did anyone hit the target this frame?
      const winners = justScored.filter(i => scores[i] >= targetPoints);
      if (winners.length > 0) {
        if (winners.length === 1 && winners[0] === winIdx) {
          winnerThisRun = winIdx;
        }
        break;
      }
    }

    world.cleanup();
    if (winnerThisRun === winIdx) {
      return {
        winnerIndex: winIdx,
        paths:       paths.map(a => new Float32Array(a)),
        offsets:     spawnXs,
        crossings,
      };
    }
    return null;
  }

  /**
   * Rebuild a fresh world (pegs + static balls) and warp them along
   * the recorded Float32Array `paths`.
   */
  replayRace(race: RecordedRace) {
    // clean up any prior replay
    if (this.replayWorld) this.replayWorld.cleanup();

    // new world for replay
    const world = new PhysicsWorld(this.rows);
    this.replayWorld = world;

    // static bodies for balls at their spawn X
    const staticBalls = race.paths.map((_,i) => {
      const x = race.offsets[i] ?? WIDTH/2;
      return Bodies.circle(x, -10, BALL_RADIUS, {
        isStatic: true,
        label:    'Ball',
        plugin:   { playerIndex: i },
      });
    });
    Composite.add(world.world, staticBalls);

    const totalFrames = race.paths[0].length / 2;
    let frame = 0;
    const step = () => {
      staticBalls.forEach((b,i) => {
        const arr = race.paths[i];
        const idx = Math.min(frame, arr.length/2 - 1);
        Body.setPosition(b, { x: arr[idx*2], y: arr[idx*2+1] });
      });
      frame++;
      if (frame < totalFrames) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /**
   * Merge the **static** peg world with any **replay** bodies,
   * so your Canvas’s `engine.getBodies()` always shows both.
   */
  getBodies() {
    const pegs  = this.staticWorld.getBodies();
    const balls = this.replayWorld ? this.replayWorld.getBodies() : [];
    return [...pegs, ...balls];
  }

  /** tear down everything */
  cleanup() {
    this.staticWorld.cleanup();
    if (this.replayWorld) this.replayWorld.cleanup();
  }
}
