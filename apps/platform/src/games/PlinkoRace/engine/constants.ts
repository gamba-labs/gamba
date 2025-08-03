// src/engine/constants.ts
export const WIDTH           = 700;
export const HEIGHT          = 700;

export const PEG_RADIUS      = 5;
export const BALL_RADIUS     = 13;
export const GRAVITY         = 0.9;
export const RESTITUTION     = 0.6;
export const ROWS            = 14;
export const TIME_SCALE      = 4;   

/** 
 * One row of “cells” across the bottom  
 * Positive ⇒ mult, 0⇒spawn, negative⇒score 
 */
export const BUCKET_DEFS     = [3, -10, 2, -5, 1.5, -2, 0, -2, 1.5, -5, 2, -10, 3];
export const BUCKET_HEIGHT   = 60;
