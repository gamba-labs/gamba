import { lamportsToSol } from 'gamba-core'

/** Converts lamports into a human readable string */
export const formatLamports = (lamports: number, suffix = 'SOL', fractionDigits = 4) => {
  return lamportsToSol(lamports).toLocaleString(undefined, { maximumFractionDigits: fractionDigits }) + (suffix ? ' ' + suffix : '')
}

export const cx = (...args: unknown[]) => {
  return args
    .flat()
    .filter(x => typeof x === 'string')
    .join(' ')
    .trim()
}
