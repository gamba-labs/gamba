import { useEffect, useState, useCallback } from 'react';
import { SimulationEngine, RecordedRace }   from '../engine/SimulationEngine';
import { PlayerInfo }                       from '../engine/types';

/**
 *  Fast deterministic Plinko simulation hook
 *  – no `rows` argument any more (rows are fixed at ROWS in PhysicsWorld)
 */
export function useMultiPlinko(
  players: PlayerInfo[],
  seed?: string,
) {
  const [engine, setEngine] = useState<SimulationEngine | null>(null);

  /* create / dispose */
  useEffect(() => {
    const sim = new SimulationEngine(players, seed);
    setEngine(sim);
    return () => sim.cleanup();
  }, [players.map(p => p.id).join(','), seed]);

  /* stable wrappers */
  const recordRace = useCallback(
    (winnerIdx: number, target?: number): RecordedRace => {
      if (!engine) throw new Error('Engine not ready');
      return engine.recordRace(winnerIdx, target);
    },
    [engine],
  );

  const replayRace = useCallback(
    (rec: RecordedRace, onFrame?: (f: number) => void) => {
      if (!engine) throw new Error('Engine not ready');
      engine.replayRace(rec, onFrame);
    },
    [engine],
  );

  return { engine, recordRace, replayRace };
}
