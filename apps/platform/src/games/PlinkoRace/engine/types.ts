// add crossings to RecordedRace
export interface PlayerInfo {
  id: string;
  color: string;
}

export interface RecordedRace {
  winnerIndex: number;
  paths: Float32Array[];    // positions [x0,y0,x1,y1...]
  offsets: number[];        // spawn X per ball
  crossings: number[][];    // list of frame indices for each ball’s finish‐line touches
}
