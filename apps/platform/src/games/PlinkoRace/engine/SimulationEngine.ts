// src/engine/SimulationEngine.ts
import Matter, { Composite, Bodies, Body } from 'matter-js';
import { PhysicsWorld, WIDTH, HEIGHT, BALL_RADIUS } from './PhysicsWorld';
import { PlayerInfo, RecordedRace }               from './types';

const MAX_FRAMES       = 200_000;
const MAX_ATTEMPTS     = 60;
const POINTS_PER_CROSS = 50;

export class SimulationEngine {
  private rows        : number;
  private players     : PlayerInfo[];

  /** Static world for pegs (always present) */
  private staticWorld : PhysicsWorld;

  /** Replay world for showing the recorded run */
  private replayWorld ?: PhysicsWorld;

  constructor(rows: number, players: PlayerInfo[]) {
    this.rows    = rows;
    this.players = players;

    // Build and keep around the static peg world immediately
    this.staticWorld = new PhysicsWorld(rows);
  }

  /**
   * Brute-force until you get a run where ONLY `winnerIndex`
   * is first to `targetPoints` (no ties). Returns the RecordedRace.
   */
  recordRace(
    winnerIndex: number,
    targetPoints = 100
  ): RecordedRace {
    const W = Math.max(0, Math.min(this.players.length - 1, winnerIndex));

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const rec = this.runSingleAttempt(W, targetPoints);
      if (rec) {
        console.log(`[SimulationEngine] SUCCESS: Winner ${W} on attempt ${attempt}`);
        return rec;
      }
      console.log(`[SimulationEngine] attempt ${attempt} rejected`);
    }

    throw new Error(
      `SimulationEngine: no valid run for winner ${W} after ${MAX_ATTEMPTS} attempts`
    );
  }

  /** One continuous simulation, with immediate respawn and scoring. */
  private runSingleAttempt(
    winIdx: number,
    targetPoints: number
  ): RecordedRace | null {
    // ── Local world for simming this attempt ───────────
    const world     = new PhysicsWorld(this.rows);
    const ballLayer = Composite.create();
    Composite.add(world.world, ballLayer);

    // Fixed spawn X positions
    const spawnXs = this.players.map(() => WIDTH/2 + Matter.Common.random(-8,8));

    // Spawn dynamic balls
    const bodies: Body[] = spawnXs.map((x,i) =>
      Bodies.circle(x, -10, BALL_RADIUS, {
        restitution: 0.4,
        collisionFilter: { group: -1 },
        label: 'Ball',
        plugin: { playerIndex: i },
      })
    );
    Composite.add(ballLayer, bodies);

    // Record paths + crossings + scores
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
          Body.setVelocity(b, { x:0, y:0 });
        }
      });

      // if anyone hit target this frame…
      const winners = justScored.filter(i => scores[i] >= targetPoints);
      if (winners.length > 0) {
        // accept only if exactly one AND it's our chosen winner
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
   * Builds a _new_ PhysicsWorld for the replay, spawns _static_ balls
   * and then warps them along the recorded paths.
   */
  replayRace(race: RecordedRace) {
    // tear down any prior replay world
    if (this.replayWorld) this.replayWorld.cleanup();

    // new world containing just pegs (again) + static "balls"
    const world = new PhysicsWorld(this.rows);
    this.replayWorld = world;

    const staticBalls = race.paths.map((_, i) => {
      const x = race.offsets[i] ?? WIDTH/2;
      return Bodies.circle(x, -10, BALL_RADIUS, {
        isStatic: true,
        label:    'Ball',
        plugin:   { playerIndex: i },
      });
    });
    Composite.add(world.world, staticBalls);

    const total = race.paths[0].length / 2;
    let frame   = 0;
    const step  = () => {
      staticBalls.forEach((b, i) => {
        const path = race.paths[i];
        const idx  = Math.min(frame, path.length/2 - 1);
        Body.setPosition(b, {
          x: path[idx*2],
          y: path[idx*2+1],
        });
      });
      frame++;
      if (frame < total) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /**
   * Expose both the static pegs _and_ any replay bodies together,
   * so your Canvas draw always shows the map + balls.
   */
  getBodies() {
    // pegs from the staticWorld
    const pegs = this.staticWorld.getBodies();
    // balls (and nothing else) from the replayWorld, if any
    const balls = this.replayWorld ? this.replayWorld.getBodies() : [];
    return [...pegs, ...balls];
  }

  /** tear down both worlds */
  cleanup() {
    this.staticWorld.cleanup();
    if (this.replayWorld) this.replayWorld.cleanup();
  }
}
