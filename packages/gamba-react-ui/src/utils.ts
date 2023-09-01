import { lamportsToSol } from 'gamba-core'

/** Converts lamports into a human readable string */
export const formatLamports = (lamports: number, suffix = 'SOL', fractionDigits = 4) => parseFloat(lamportsToSol(lamports).toFixed(fractionDigits)) + (suffix ? ' ' + suffix : '')

export const copyTextToClipboard = async (text: string) => {
  if ('clipboard' in navigator) {
    return await navigator.clipboard.writeText(text)
  } else {
    return document.execCommand('copy', true, text)
  }
}
