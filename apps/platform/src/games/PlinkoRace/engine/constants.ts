// engine/constants.ts
export const WIDTH          = 700;
export const HEIGHT         = 700;

export const PEG_RADIUS     = 11;
export const BALL_RADIUS    = 9;
export const GRAVITY        = 1;

/**
 * One row of “cells” across the bottom.  
 * Positive ⇒ multiplier, 0 ⇒ spawn (unused for now), negative ⇒ score.
 *
 * 3  -10  2  -5  1.5  -2   0  -2  1.5  -5  2  -10  3
 */
export const BUCKET_DEFS    = [ 3, -10, 2, -5, 1.5, -2, 0, -2, 1.5, -5, 2, -10, 3 ];
export const BUCKET_HEIGHT  = 60;
export const POINTS_PER_CROSS = 50;              // keeps old “finish‑line” logic alive
