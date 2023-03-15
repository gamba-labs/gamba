# Gamba Coin Flip Example

## Quick setup

1. [Install yarn](https://classic.yarnpkg.com/lang/en/docs/install/)

2. Clone this repository

3. Configure your app and host it ([We recommend Vercel](https://vercel.com/))

4. Earn fees!

## Configuration

Create a `.env` file with the following contents

```
VITE_GAMBA_NAME=Gamba Flip # required
VITE_GAMBA_CREATOR=<YOUR SOLANA PUBLIC KEY> # required
VITE_RPC_ENDPOINT=<SOLANA RPC ENDPOINT>
VITE_RPC_WS_ENDPOINT=<SOLANA RPC WEBSOCKET ENDPOINT>
```

If you're hosting on Vercel make sure you set the root directory to `example`.

> **Warning**
> If you're using a brand new Solana address as your creator wallet, make sure you initialize it by sending some SOL to it (~0.001 SOL should be enough)

# Demo

This example is hosted [here](https://flip.gamba.so)
