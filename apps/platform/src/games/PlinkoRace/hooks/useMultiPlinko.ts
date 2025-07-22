// src/hooks/useMultiPlinko.ts
import { useEffect, useState, useCallback } from 'react';
import { SimulationEngine, RecordedRace }   from '../engine/SimulationEngine';
import { PlayerInfo }                       from '../engine/types';
import { makeRng }                          from '../engine/deterministic';

/**
 * Hook to create & tear down a SimulationEngine.
 * @param rows     number of peg rows
 * @param players  PlayerInfo[] roster
 * @param gamePk   Base58 game address for deterministic RNG
 */
export function useMultiPlinko(
  rows: number,
  players: PlayerInfo[],
  gamePk?: string
) {
  const [engine, setEngine] = useState<SimulationEngine|null>(null);

  useEffect(() => {
    // pass gamePk so SimulationEngine seeds its RNG deterministically
    const sim = new SimulationEngine(rows, players, gamePk);
    setEngine(sim);
    return () => sim.cleanup();
  }, [rows, players.map(p=>p.id).join(','), gamePk]);

  const recordRace = useCallback(
    (idx: number): RecordedRace => {
      if (!engine) throw new Error('Engine not ready');
      return engine.recordRace(idx);
    },
    [engine]
  );

  const replayRace = useCallback(
    (rec: RecordedRace) => {
      if (!engine) throw new Error('Engine not ready');
      engine.replayRace(rec);
    },
    [engine]
  );

  return { engine, recordRace, replayRace };
}
