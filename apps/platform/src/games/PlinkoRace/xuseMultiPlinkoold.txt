import { useEffect, useState } from 'react'
import { MultiPlinko, PlayerInfo, RecordedRace } from './engine'

export function useMultiPlinko(
  opts: { rows:number; players:PlayerInfo[] },
  deps: React.DependencyList
){
  const [eng, setEng] = useState<MultiPlinko|null>(null)

  useEffect(()=>{
    const e = new MultiPlinko(opts.rows, opts.players)
    setEng(e)
    return ()=> e.cleanup()
  }, deps)

  const recordRace = (winnerIdx:number):RecordedRace=>{
    if (!eng) throw new Error('Engine not ready')
    return eng.recordRace(winnerIdx)
  }
  const replayRace = (r:RecordedRace)=> eng?.replayRace(r)

  return { engine: eng, recordRace, replayRace }
}
