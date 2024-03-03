import { PublicKey } from '@solana/web3.js'
import { TokenMeta } from './tokens'

interface HeliusTokenFetcherParams {
  dollarBaseWager?: number
}

/**
 * Creates a token metadata fetcher that batches token mints and uses a Helius RPC's "getAssetBatch" method to retrieve their info
 * @param heliusApiKey (Required Helius API key)
 * @returns
 */
export function makeHeliusTokenFetcher(
  heliusApiKey: string,
  params: HeliusTokenFetcherParams = {},
) {
  const { dollarBaseWager = 1 } = params
  return async (tokenMints: string[]) => {
    const response = await fetch('https://mainnet.helius-rpc.com/?api-key=' + heliusApiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetBatch',
        params: { ids: tokenMints },
      }),
    })

    const { result } = (await response.json()) as { result: any[] }

    const tokens = result
      .filter((x) => !!x)
      .reduce((prev, x) => {
        const info = (x as any)?.token_info
        const usdPrice = info?.price_info?.price_per_token
        const data: TokenMeta = {
          mint: new PublicKey(x.id),
          image: x.content?.links?.image,
          symbol: x.content?.metadata.symbol ?? info.symbol,
          decimals: info.decimals,
          name: x.content?.metadata.name ?? info.symbol,
          baseWager: ((dollarBaseWager / usdPrice) * (10 ** info.decimals)) || 1,
          usdPrice,
          // usdPrice: info.price_info?.price_per_token ?? 0,
        }
        return { ...prev, [x.id.toString()]: data }
      }, {} as Record<string, TokenMeta>)

    return tokens as Record<string, TokenMeta>
  }
}
