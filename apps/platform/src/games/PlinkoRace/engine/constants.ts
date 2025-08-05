// src/engine/constants.ts
export const WIDTH  = 700;
export const HEIGHT = 700;

export const PEG_RADIUS   = 5;
export const BALL_RADIUS  = 13;
export const GRAVITY      = 0.9;
export const RESTITUTION  = 0.6;
export const ROWS         = 14;
export const TIME_SCALE   = 4;   // 4× realtime

/*───────────────────────────*/
/*  BUCKET SYSTEM RE‑DESIGN  */
/*───────────────────────────*/

export enum BucketType {
  Blank       = 'blank',       // does nothing, ball just respawns
  Score       = 'score',       // awards fixed points   (value = points)
  Multiplier  = 'mult',        // multiplies next score (value = multiplier)
  ExtraBall   = 'extraBall',   // spawns an extra ball  (no value)
  Kill        = 'kill',        // removes ball forever (no value)
  Dynamic     = 'dynamic',     // placeholder – cycles through MODES below
}

export interface BucketDef {
  type  : BucketType;
  value?: number;      // used by Score / Multiplier
}

/** Static row, left → right. */
export const BUCKET_DEFS: BucketDef[] = [
  { type: BucketType.Multiplier, value: 3 },
  { type: BucketType.Score,      value: 10 },
  { type: BucketType.Multiplier, value: 2 },
  { type: BucketType.Score,      value: 5 },
  { type: BucketType.ExtraBall },
  { type: BucketType.ExtraBall },

  { type: BucketType.ExtraBall },           // ← centre bucket

  { type: BucketType.ExtraBall },
  { type: BucketType.ExtraBall },
  { type: BucketType.Score,      value: 5 },
  { type: BucketType.Multiplier, value: 2 },
  { type: BucketType.Score,      value: 10 },
  { type: BucketType.Multiplier, value: 3 },
];

export const DYNAMIC_SEQUENCE: BucketType[] = [
  BucketType.Blank,
  BucketType.ExtraBall,
  BucketType.Multiplier,        // 5×
];
export const DYNAMIC_EXTRA_MULT = 5;       // value when in Multiplier mode

export const BUCKET_HEIGHT = 60;
export const CENTER_BUCKET = BUCKET_DEFS.findIndex(b => b.type === BucketType.Dynamic);
