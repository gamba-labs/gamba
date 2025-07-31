// src/engine/SimulationEngine.ts
import Matter, { Composite, Bodies, Body } from 'matter-js';
import {
  PhysicsWorld,
  WIDTH,
  HEIGHT,
  BALL_RADIUS,
  BUCKET_DEFS,
  BUCKET_HEIGHT,
} from './PhysicsWorld';
import { makeRng }    from './deterministic';
import { PlayerInfo } from './types';

export interface RecordedRaceEvent {
  frame : number;
  player: number;
  kind  : 'score' | 'mult';
  value : number;
}
export interface RecordedRace {
  winnerIndex : number;
  paths       : Float32Array[];
  offsets     : number[];
  events      : RecordedRaceEvent[];
  totalFrames : number;
}

const MAX_FRAMES    = 200_000;
const MAX_ATTEMPTS  = 60;
const TARGET_POINTS = 50;

// how many sim-steps we pack into one UI frame
const SPEED_FACTOR = 4;
// any upward jump larger than this is treated as a teleport (respawn)
const TELEPORT_DY = HEIGHT * 0.5;

export class SimulationEngine {
  private players     : PlayerInfo[];
  private rng         : () => number;
  private staticWorld = new PhysicsWorld();
  private replayWorld?: PhysicsWorld;

  constructor(players: PlayerInfo[], seed?: string) {
    this.players = players;
    this.rng     = seed ? makeRng(seed) : Math.random;
  }

  /** Brute-force at 4× speed until only `winnerIdx` reaches TARGET_POINTS first. */
  recordRace(winnerIdx: number, target = TARGET_POINTS): RecordedRace {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      console.log(`[SimulationEngine] attempt ${attempt}/${MAX_ATTEMPTS}…`);
      const rec = this.runSingleAttempt(winnerIdx, target);
      if (rec) {
        console.log(
          `[SimulationEngine] SUCCESS after ${attempt} attempt${attempt>1?'s':''}` +
          ` (winner=${winnerIdx}, frames=${rec.totalFrames})`
        );
        return rec;
      }
      console.log(`[SimulationEngine] …rejected`);
    }
    throw new Error(
      `SimulationEngine: no valid run for winner ${winnerIdx}`
    );
  }

  /** One 4×-sped sim run; null if someone else hits target first. */
  private runSingleAttempt(winIdx: number, target: number): RecordedRace | null {
    const sim = new PhysicsWorld();
    const ballLayer = Composite.create();
    Composite.add(sim.world, ballLayer);

    // deterministic spawn X offsets ±8px
    const spawnXs = this.players.map(() =>
      WIDTH/2 + (this.rng()*16 - 8)
    );

    // dynamic balls
    const balls: Body[] = spawnXs.map((x,i) =>
      Bodies.circle(x, -10, BALL_RADIUS, {
        restitution: 0.4,
        collisionFilter: { group: -1 },
        label: 'Ball',
        plugin: { playerIndex: i },
      })
    );
    Composite.add(ballLayer, balls);

    // recorders
    const paths  = this.players.map(() => [] as number[]);
    const scores = new Uint32Array(this.players.length);
    const mults  = new Uint8Array(this.players.length).fill(1);
    const events : RecordedRaceEvent[] = [];

    const respawn = (b: Body, i: number) => {
      Body.setPosition(b, { x: spawnXs[i], y: -10 });
      Body.setVelocity(b, { x: 0, y: 0 });
    };

    let totalFrames = 0;
    outer: for (let frame = 0; frame < MAX_FRAMES; frame++) {
      // one 4×-sped tick
      sim.tick();

      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        // record path
        paths[i].push(b.position.x, b.position.y);

        // bucket region only
        if (b.position.y >= HEIGHT - BUCKET_HEIGHT) {
          const bw  = WIDTH / BUCKET_DEFS.length;
          const idx = Math.max(
            0,
            Math.min(BUCKET_DEFS.length - 1, Math.floor(b.position.x / bw))
          );
          const def = BUCKET_DEFS[idx];
          if (def > 1) {
            mults[i] = Math.min(mults[i] * def, 64);
            events.push({ frame, player: i, kind: 'mult', value: def });
          } else if (def < 0) {
            const pts = -def * mults[i];
            scores[i] += pts;
            events.push({ frame, player: i, kind: 'score', value: pts });
            mults[i] = 1;
          }
          respawn(b, i);
        }

        // reject if anybody else wins first
        if (i !== winIdx && scores[i] >= target) {
          sim.cleanup();
          return null;
        }
        // accept if our winner wins and all others below
        if (
          i === winIdx &&
          scores[i] >= target &&
          Array.from(scores).every((s,j)=> j===winIdx || s<target)
        ) {
          totalFrames = frame + 1;  // include this frame
          break outer;
        }
      }
    }

    sim.cleanup();
    if (totalFrames === 0) return null;

    // trim paths to actual length
    paths.forEach(a => { a.length = totalFrames * 2; });
    // stretch out every event/frame for UI
    events.forEach(e => e.frame *= SPEED_FACTOR);

    return {
      winnerIndex: winIdx,
      paths:       paths.map(a => new Float32Array(a)),
      offsets:     spawnXs,
      events,
      totalFrames: totalFrames * SPEED_FACTOR,
    };
  }

  /** Normal-speed replay with teleport-skip interpolation */
  replayRace(rec: RecordedRace, onFrame?: (f:number)=>void) {
    this.replayWorld?.cleanup();
    const world = new PhysicsWorld();
    this.replayWorld = world;

    const balls = rec.paths.map((_,i) =>
      Bodies.circle(rec.offsets[i], -10, BALL_RADIUS, {
        isStatic:true,
        label:'Ball',
        plugin:{ playerIndex:i },
      })
    );
    Composite.add(world.world, balls);

    let f = 0;
    const N = rec.totalFrames;
    const step = () => {
      const coarse = Math.floor(f / SPEED_FACTOR);
      const alpha  = (f % SPEED_FACTOR) / SPEED_FACTOR;

      balls.forEach((b,i) => {
        const arr = rec.paths[i];
        const len = arr.length/2 - 1;
        const i0  = Math.min(coarse, len);
        const i1  = Math.min(i0+1, len);
        const x0 = arr[i0*2],   y0 = arr[i0*2+1];
        const x1 = arr[i1*2],   y1 = arr[i1*2+1];

        let x,y;
        if (y0 - y1 > TELEPORT_DY) {
          // teleport—no tween
          if (alpha === 0) { x = x0; y = y0; }
          else             { x = x1; y = y1; }
        } else {
          // smooth tween
          x = x0*(1-alpha) + x1*alpha;
          y = y0*(1-alpha) + y1*alpha;
        }
        Body.setPosition(b, { x, y });
      });

      onFrame?.(f);
      if (++f < N) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  getBodies() {
    return [
      ...this.staticWorld.getBodies(),
      ...(this.replayWorld ? this.replayWorld.getBodies() : []),
    ];
  }

  cleanup() {
    this.staticWorld.cleanup();
    this.replayWorld?.cleanup();
  }
}
