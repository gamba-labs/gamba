import { PublicKey } from '@solana/web3.js'

export function getReferralLink(prefix: string, address: PublicKey | string) {
  return location.protocol + '//' + location.host + '?' + prefix + '=' + address.toString()
}

export function getReferralAddressFromUrl(prefix: string) {
  const params = new URLSearchParams(location.search)
  const referralAddressString = params.get(prefix)
  if (!referralAddressString) return null
  try {
    return new PublicKey(referralAddressString)
  } catch (err) {
    console.error('Failed to parse code')
    return null
  }
}
