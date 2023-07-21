import { lamportsToSol } from 'gamba-core'

export const formatLamports = (lamports: number, suffix = 'SOL', fractionDigits = 4) => parseFloat(lamportsToSol(lamports).toFixed(fractionDigits)) + (suffix ? ' ' + suffix : '')

export async function copyTextToClipboard(text: string) {
  if ('clipboard' in navigator) {
    return await navigator.clipboard.writeText(text)
  } else {
    return document.execCommand('copy', true, text)
  }
}
