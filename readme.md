![](gamba.png)

> **Note**
> Gamba is under heavy development and all APIs are subject to change.
> Please follow us on [Twitter](https://twitter.com/GambaLabs) for updates.

# Gamba

Create on-chain betting apps for Solana with zero deployments

## TLDR

Gamba is a protocol that lets developers build web3 casino games that directly interact with the Solana blockchain. It handles all liquidity and risk, allowing creators to focus on building, all while collecting fees on every bet made through their game. Gamba is completely governed on-chain and has verifiable randomness built in.

[Read more](https://medium.com/@gambaLabs/what-is-gamba-721f6064e050)

## Installation

`yarn add gamba`

For a quick setup you can clone this repository and use the example template under /example.

[👉 Full guide here](example/readme.md)


## Example

The following example is a simple coin flip game

```tsx
import React from 'react'
import { Gamba, useGamba } from 'gamba'

function Game() {
  const gamba = useGamba()
  return (
    <>
      <button onClick={() => gamba.play([2, 0])}>
        Heads
      </button>
      <button onClick={() => gamba.play([0, 2])}>
        Tails
      </button>
    </>
  )
}

function App() {
  return (
    <Gamba name="Coin Flip" creator="<PUBLIC KEY>">
      <Game />
    </Gamba>
  )
}
```

## Resources

* [🌐 Website](https://gamba.so)

* [🌿 Medium](https://medium.com/@gambaLabs/what-is-gamba-721f6064e050)

* [🐥 Twitter](https://twitter.com/GambaLabs)

* 📝 Documentation coming soon

## Powered by Gamba

A list of projects that are currently using Gamba. Feel free to add your own game to the list!

| Title | Description | Links |
| --- | --- | --- |
| Gamba Demo | Simple coin flip example | [Website](https://play.gamba.so) |
| Your project | Submit a PR to add your game to this list or write us on Twitter | |
