// engine/PhysicsWorld.ts
import Matter, { Composite } from 'matter-js';
import { PlayerInfo }        from './types';

export const WIDTH       = 700;
export const HEIGHT      = 700;
export const BALL_RADIUS = 9;
export const PEG_RADIUS  = 11;

const GRAVITY    = 1;
const RESTITUTION = 0.4;

export class PhysicsWorld {
  public engine: Matter.Engine;
  public world: Matter.World;
  private runner: Matter.Runner;

  constructor(rows: number) {
    this.engine = Matter.Engine.create({
      gravity: { y: GRAVITY },
      timing:  { timeScale: 1 }
    });
    this.runner = Matter.Runner.create({ isFixed: true });
    this.world  = this.engine.world;

    const pegs = this.buildPegs(rows);
    Composite.add(this.world, pegs);
  }

  tick(delta = 16) {
    Matter.Runner.tick(this.runner, this.engine, delta);
  }

  getBodies() {
    return Composite.allBodies(this.world);
  }

  cleanup() {
    Matter.Runner.stop(this.runner);
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
  }

  private buildPegs(rows: number) {
    const rowH = HEIGHT / (rows + 2);
    return Array.from({ length: rows })
      .flatMap((_, r, all) => {
        const cols = r + 1;
        const rowW = (WIDTH * r) / (all.length - 1);
        const dx   = cols === 1 ? 0 : rowW / (cols - 1);
        return Array.from({ length: cols }).map((_, c) => {
          const x = WIDTH / 2 - rowW / 2 + dx * c;
          const y = rowH * r + rowH / 2;
          return Matter.Bodies.circle(x, y, PEG_RADIUS, {
            isStatic: true,
            label: 'Peg',
          });
        });
      })
      .slice(1);
  }
}
