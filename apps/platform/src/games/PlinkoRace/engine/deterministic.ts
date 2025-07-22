// src/engine/deterministic.ts
/**
 * Turn any UTF-8 string into a 32-bit seed.
 */
function seedFromString(str: string): number {
  const encoder = new TextEncoder();
  const bytes  = encoder.encode(str);
  // simple fold: seed = ((seed << 5) − seed + byte) mod 2^32
  return bytes.reduce((seed, b) => ((seed << 5) - seed + b) >>> 0, 0);
}

/**
 * Mulberry32 PRNG.
 */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build a deterministic RNG from any string seed.
 */
export function makeRng(seedString: string): () => number {
  const seed = seedFromString(seedString);
  return mulberry32(seed);
}
