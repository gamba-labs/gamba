import { config } from './config'

const priceData: Record<string, {lastFetch: number, usdPerUnit: number}> = {}

export const getPrices = async (
  tokens: string[],
  refreshMinutes = 10,
) => {
  // Only fetch tokens if they A. Don't exist or B. have not been fetched for (refreshMinutes) minutes
  const tokensToFetch = Array.from(new Set(tokens.filter(
    (x) => !priceData[x] || priceData[x].lastFetch < Date.now() - 6000 * refreshMinutes,
  )))

  if (!tokensToFetch.length) {
    return priceData
  }

  console.log('Fetching token prices', tokensToFetch)

  const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${config().HELIUS_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAssetBatch',
      params: { ids: tokensToFetch },
    }),
  })

  const { result } = (await response.json()) as { result: any[] }

  const tokenPrices = result.reduce(
    (prev, token) => {
      const tokenInfo = token.token_info
      const pricePerToken = tokenInfo?.price_info?.price_per_token ?? 0
      const decimals = token.token_info?.decimals ?? 9
      return {
        ...prev,
        [token.id]: pricePerToken / (10 ** decimals),
      }
    },
    {} as Record<string, number>,
  )

  for (const key of tokensToFetch) {
    if (tokenPrices[key] === undefined) {
      console.log('‼️ No price data for', key)
    }

    priceData[key] = {
      usdPerUnit: tokenPrices[key],
      lastFetch: Date.now(),
    }
  }

  return priceData
}
