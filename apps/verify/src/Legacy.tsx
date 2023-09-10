import { getGameHash, resultIndexFromGameHash } from 'gamba-core'
import { useState } from 'react'

const useValueThing = (n: string) => {
  const params = new URLSearchParams(window.location.search)
  const defaultValue = params.get(n) ?? ''
  return useState(defaultValue)
}

export function Legacy() {
  const [nonce, setNonce] = useValueThing('nonce')
  const [client, setClient] = useValueThing('client')
  const [rng, setRng] = useValueThing('rng')
  const [rngHashed, setRngHashed] = useValueThing('rng_hash')
  const [options, setOptions] = useValueThing('options')

  const [result, setResult] = useState<{multiplier: number, index: number}>()

  const missing = !nonce || !client || !rng || !rngHashed || !options

  const generateResult = async () => {
    if (!options) return
    const parsedOptions = options.split(',').map((x) => Number(x))
    const gameHash = await getGameHash(rng, client, Number(nonce))
    const index = resultIndexFromGameHash(gameHash, parsedOptions)
    const multiplier = parsedOptions[index]
    setResult({ multiplier, index })
  }

  return (
    <div>
      <h1>Provably Fair</h1>
      <a target="_blank" href="https://gamba.so/docs/fair" rel="noreferrer">
        How does it work
      </a>
      <br />
      <a target="_blank" href="https://github.com/gamba-labs/gamba" rel="noreferrer">
        Open source
      </a>
      <br />
      <br />
      <small>Nonce</small>
      <input value={nonce} onChange={(e) => setNonce(e.target.value)} />
      <br />
      <small>Client Seed</small>
      <input value={client} onChange={(e) => setClient(e.target.value)}  />
      <br />
      <small>Hashed RNG Seed</small>
      <input value={rngHashed} onChange={(e) => setRngHashed(e.target.value)}  />
      <br />
      <small>RNG Seed</small>
      <input value={rng} onChange={(e) => setRng(e.target.value)}  />
      <br />
      <small>Outcomes</small>
      <textarea value={options} onChange={(e) => setOptions(e.target.value)}  />
      <br />
      <button onClick={generateResult} disabled={missing}>
        Generate Result
      </button>
      {result && (
        <div>
          Multiplier: {result.multiplier / 1000}x<br />
          Index: {result.index}
        </div>
      )}
    </div>
  )
}
