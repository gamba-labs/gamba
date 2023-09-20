<a href="https://gamba.so">
  <img src="https://github.com/gamba-labs/gamba/assets/127314884/fd1227f8-8b63-4515-94fd-6ea1625e8083" alt="Gamba Banner" />
</a>

<div align="center">

[![npm version](https://img.shields.io/npm/v/gamba.svg?color=orange)](https://www.npmjs.com/package/gamba) [![npm downloads](https://img.shields.io/npm/dt/gamba.svg?color=orange)](https://www.npmjs.com/package/gamba)

<h3>Create betting games on Solana with zero deployments ✨</h3><hr />

<table>
    <tbody>
      <tr>
        <td>
          <a href="https://gamba.so">📝 Documentation</a>
        </td>
        <td>
          <a href="https://discord.com/invite/xjBsW3e8fK">💬 Discord</a>
        </td>
        <td>
          <a href="https://twitter.com/gambalabs">🐦 Twitter</a>
        </td>
      </tr>
    </tbody>
  </table>
</div>

# Gamba

Gamba is a decentralized betting platform on Solana. It handles all liquidity and randomness, allowing developers to focus on building games.

When users play on your app you will automatically collect royaltees.

[Learn more](https://gamba.so)

## Installation

If you want to create a Gamba project from scratch you can install our main package:

`npm i gamba`

## Example

The following example is a simple game where the user has a 50/50 chance of doubling their money.

```jsx
import React from 'react'
import { Gamba, useGamba } from 'gamba/react'

function DoubleOrNothing() {
  const gamba = useGamba()
  const [profit, setProfit] = React.useState(0)

  const play = async () => {
    // Request user to sign transaction
    const request = await gamba.play({
      bet: [0, 2], // 0x or 2x
      wager: 1e9 * 0.1, // 0.1 SOL
    })
    // Await the result
    const result = await request.result()
    // Show profit in UI
    setProfit(profit + result.profit)
  }

  return (
    <>
      <button onClick={play}>
        Double or Nothing
      </button>
      {profit > 0 && (
        <button onClick={() => gamba.withdraw(profit)}>
          Claim {profit / 1e9} SOL
        </button>
      )}
    </>
  )
}

function App() {
  return (
    <Gamba creator="<PUBLIC KEY>">
      <DoubleOrNothing />
    </Gamba>
  )
}
```

## Packages

`gamba` contains all the individual packages listed below. In most cases this is the only library you need to install.

## Nested packages:

The packages listed here are already included in the main `gamba` package, but can also be installed independently if needed. They are reachable under `gamba/<package>`.

* [`gamba-core`](https://github.com/gamba-labs/gamba/tree/main/packages/gamba-core) contains the essential stuff and works in other environment such as NodeJS

* [`gamba-react`](https://github.com/gamba-labs/gamba/tree/main/packages/gamba-react) contains everything related to React such as context providers and hooks.

* [`gamba-react-ui`](https://github.com/gamba-labs/gamba/tree/main/packages/gamba-react-ui) contains useful components and utilities for building games in your platform.

## Documentation

Read our WIP documentation at [gamba.so](https://gamba.so/docs), or ask away in [Discord](https://discord.com/invite/xjBsW3e8fK)
