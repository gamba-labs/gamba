// src/engine/types.ts

export interface PlayerInfo {
  id: string;
  color: string;
}

/** One discrete bucket/multiplier event in the recording */
export interface RecordedRaceEvent {
  frame  : number;            // which tick/frame it occurred on
  player : number;            // which ball/player
  kind   : 'score' | 'mult';  // bucket‐score vs multiplier
  value  : number;            // points gained or multiplier applied
}

/** Full recorded run, including every per‐frame path + bucket events */
export interface RecordedRace {
  winnerIndex: number;
  paths      : Float32Array[];       // [x0,y0,x1,y1...]
  offsets    : number[];             // per‐ball spawn X
  events     : RecordedRaceEvent[];  // <— newly added
  totalFrames: number;
}
