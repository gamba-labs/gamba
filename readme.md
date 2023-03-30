<p align="center">
  <img src="gamba.png" />
</p>

<br />

<h1 align="center">Gamba</h1>
<h3 align="center">Create on-chain betting apps for Solana with zero deployments</h3>

<br>

> **Note**
> Gamba is under heavy development and all APIs are subject to change. Please follow us on [Twitter](https://twitter.com/GambaLabs) for updates.

## TLDR

Gamba is a protocol that lets developers build web3 casino games for Solana. It handles all liquidity and risk, as well as on-chain randomness, allowing creators to focus on building their game. As a developer you collect fees on every bet made on your game.

This package lets you build a react app that interacts with Gamba's Anchor program using a simple API.

[Learn more](https://medium.com/@gambaLabs/what-is-gamba-721f6064e050)

## Installation

`yarn add gamba`

For a quick setup you can check out the guide on our Coin Flip repo

[👉 Full template guide here](https://github.com/gamba-labs/flip)


## Basic Usage

The following example is a simple game where the user has a 50/50 chance of doubling their money.

```tsx
import React from 'react'
import { Gamba, useGamba } from 'gamba'

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
    <Gamba name="Double Or Nothing" creator="<PUBLIC KEY>">
      <DoubleOrNothing />
    </Gamba>
  )
}
```

## API Documentation

### Setup

The `<Gamba />` component is the root component of your app. It will provide your app with all the contexts needed to begin making method calls to the Gamba on-chain program.

```tsx
function App() {
  return (
    <Gamba
      name="<APP NAME>"
      creator="<CREATOR PUBLICKEY>"
    >
      ...
    </Gamba>
  )
}
```

Any child components of the Gamba provider can now start using the `useGamba` hook, which contains info about the connected user, their gamba account, and method calls they can make.

### Methods

#### Creating a Gamba account

> **Note**
> This only has to be done once per user, as they will use the same account for every Gamba game they play.
> Your app should assume that your users may not already have an account and offer a way to create one.

In order to play any game on Gamba, a user first needs to have a Gamba user account associated with their wallet. We can check if the user already has an account by looking at `gamba.user.created`. If the value is `false` we can create an account for the user by calling `gamba.init()`. Example:

```tsx
const gamba = useGamba()

const createGambaAccount = () => {
  if (gamba.user.created) {
    throw new Error('Gamba account already created')
  }
  gamba.init()
}
```


#### Creating a bet

Bets in Gamba are composed by a numbered array called a **bet config** and a wager amount in lamports.

By calling the `play` method, Gamba's on-chain program will generate a random index between 0 and the length of the bet array.

The value of the **bet config** array at that random index multiplied by the wager amount will determine how much the player will win back.

In the following example the player will pay `BET_AMOUNT` lamports to initiate the bet, and then receive `BET_AMOUNT * 2` if the bet lands on `0`, and `BET_AMOUNT * 0` if it lands on `1`.

```tsx
const gamba = useGamba()

const BET_AMOUNT = 1e8 // 1 SOL

gamba.play([2, 0], BET_AMOUNT)
```

We can create longer arrays with different values, but it's important that the sum of the array is less or equal to its length because otherwise we would put the house at a disadvantage. Examples:

* [0, 2] allowed ✅
* [1.5, .5] allowed ✅
* [0, 3] not allowed ❌
* [5, 0, 0, 0, 0] allowed ✅
* [3, 2, 1, 0, 0, 0] allowed✅

### Handling results

In most apps we want to display the result of the player's bet when it's done, and a loading indicator while the result is being generated. This example does that:

```tsx
const [loading, setLoading] = useState(false)
const BET_AMOUNT = 1e8 // 1 SOL

const play = async () => {
  try {
    const response = await gamba.play([2, 0], BET_AMOUNT)
    setLoading(true)
    const result = await response.result()
    // ... do something with the result
  } catch (err) {
    // ... do something with the error
  } finally {
    setLoading(false)
  }
}
```

Here we await the response of `gamba.play`, which will finish once the user has confirmed the transaction with their wallet.

To wait for the actual result, we also have to await the `response.result` promise of the response object, which will finish once the bet has been settled on-chain, or throw an error if the bet for some reason failed.


#### Withdrawing

Every time the player wins a bet, the payout will be added to the player's user account balance. The `withdraw` method can be called to claim any or all funds currently in the Gamba account.

The following example withdraws all the SOL available in the player's user account:

```tsx
const gamba = useGamba()

gamba.withdraw(gamba.user.balance)
```

## Resources

* [🌐 Website](https://gamba.so)

* [🌿 Medium](https://medium.com/@gambaLabs/what-is-gamba-721f6064e050)

* [🐥 Twitter](https://twitter.com/GambaLabs)

* 📝 Full documentation coming soon

## Powered by Gamba

A list of projects that are currently using Gamba. Feel free to add your own game to the list!

| Title | Description | Links |
| --- | --- | --- |
| Gamba Demo | Simple coin flip example | [Website](https://flip.gamba.so) |
| Your project | Submit a PR to add your game to this list or write us on Twitter | |
