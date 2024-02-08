import { signal } from "@preact/signals-react"
import { PublicKey } from "@solana/web3.js"
import React from "react"

const FETCH_DEBOUNCE_MS = 200

const addresses = signal(new Set<string>)
const domainsByAddress = signal<Record<string, string[]>>({})

let fetchTimeout: any

const fetchBonfidaName = async (token: string) => {
  addresses.value = new Set([...Array.from(addresses.value), token])

  clearTimeout(fetchTimeout)

  fetchTimeout = setTimeout(async () => {
    const unique = Array.from(addresses.value).filter((x) => !Object.keys(domainsByAddress.value).includes(x))

    if (!unique.length) return

    const req = await fetch(`https://sns-api.bonfida.com/v2/user/domains/${unique.join(',')}`)
    const res = await req.json() as Record<string, string[]>

    domainsByAddress.value = {...domainsByAddress.value, ...res}
    addresses.value = new Set
  }, FETCH_DEBOUNCE_MS)
}

export function useBonfidaName(mint: string | PublicKey) {
  React.useEffect(() => {
    fetchBonfidaName(mint.toString())
  }, [mint])

  const addresses = domainsByAddress.value[mint.toString()]
  return addresses ? addresses[0] + ".sol" : undefined
}
