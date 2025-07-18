import { useEffect, useState, useCallback } from 'react';
import { SimulationEngine, RecordedRace }   from '../engine';
import { PlayerInfo }                       from '../engine/types';

export function useMultiPlinko(
  rows: number,
  players: PlayerInfo[]
) {
  const [engine, setEngine] = useState<SimulationEngine|null>(null);

  // Re-create engine only when `rows` or the list of player IDs changes
  useEffect(() => {
    const sim = new SimulationEngine(rows, players);
    setEngine(sim);
    return () => sim.cleanup();
  }, [rows, players.map(p => p.id).join(',')]);

  // Wrap these so their identity only changes when `engine` does
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
