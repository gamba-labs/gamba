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

```tsx
import React from 'react'
import { Gamba, useGamba } from 'gamba/react'

function DoubleOrNothing() {
  const gamba = useGamba()
  return (
    <button onClick={() => gamba.play([0, 2])}>
      Double or Nothing
    </button>
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

### Main package

`gamba` contains both `gamba-core` and `gamba-react`. This should be used rather than installing the nested packages seperately in most cases.

* [`gamba-core`](https://github.com/gamba-labs/gamba/tree/main/packages/gamba-core) contains the essential stuff and works in other environment such as NodeJS

* [`gamba-react`](https://github.com/gamba-labs/gamba/tree/main/packages/gamba-react) contains everything related to React such as context providers and hooks. Reachable in `gamba/react`

### React UI Package

[`gamba-react-ui`](https://github.com/gamba-labs/gamba/tree/main/packages/gamba-react-ui) contains useful tools and components for managing the user's Gamba account.

## Documentation

Read our WIP documentation at [gamba.so](https://gamba.so/docs), or ask away in [Discord](https://discord.com/invite/xjBsW3e8fK)
