import { lamportsToSol } from 'gamba-core'

export const formatLamports = (lamports: number, suffix = 'SOL', fractionDigits = 4) => parseFloat(lamportsToSol(lamports).toFixed(fractionDigits)) + (suffix ? ' ' + suffix : '')
