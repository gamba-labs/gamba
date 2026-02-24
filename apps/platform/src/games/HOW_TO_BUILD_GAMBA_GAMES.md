# Building Gamba Games in This Repo (V2)

This guide is adapted for the code in this repository (`apps/platform`, `gamba-react-v2`, `gamba-react-ui-v2`).

Use it as a reference when adding or editing game implementations under `apps/platform/src/games/*`.

## 1. Core model for singleplayer games

Every play is:

- `wager`: amount in token atomic units (lamports for SOL, token base units for SPL)
- `bet`: array of multipliers

The protocol chooses one index in `bet` with equal probability.

If `bet.length = N`:

- each index has probability `1 / N`
- selected multiplier is `bet[resultIndex]`
- payout is `wager * bet[resultIndex]`

In this repo, game code usually writes multipliers as decimals (`2`, `0.5`, etc). They are converted to basis points before tx send in:

- `packages/core/src/GambaProvider.ts` (`bet.map(basisPoints)`)
- `packages/core/src/utils.ts` (`basisPoints`)

## 2. The important rule: `sum(bet) <= bet.length`

Expected multiplier:

`E = sum(bet) / bet.length`

So:

- `sum(bet) == bet.length` -> fair before fees (`EV = 1.0x`)
- `sum(bet) < bet.length` -> house edge
- `sum(bet) > bet.length` -> player edge (invalid design, likely rejected on-chain)

For dynamic arrays, always normalize or clamp before sending.

## 3. Play flow in this repo

Typical game flow:

1. Build `bet` + `wager` in your game component.
2. Call `await game.play({ wager, bet, metadata? })` from `GambaUi.useGame()`.
3. Call `const result = await game.result()`.
4. Animate using `result.resultIndex`, `result.multiplier`, `result.payout`, or `result.profit`.

Main references:

- `packages/react-ui/src/hooks/useGame.ts`
- `packages/react/src/hooks/useGambaPlay.ts`
- `packages/react/src/hooks/useGamba.ts`

Important details:

- `GambaUi.useGame().play(...)` auto-injects platform values (creator, fees, selected token/pool, client seed).
- It also prefixes metadata as `['0', gameId, ...args]`.
- If wallet is disconnected, play throws `NOT_CONNECTED`.

## 4. Where games are wired in the platform app

1. Add your game folder:
   - `apps/platform/src/games/MyGame/index.tsx`
2. Register it in:
   - `apps/platform/src/games/index.tsx` (`GAMES` array)
3. Route is automatic from:
   - `apps/platform/src/App.tsx` (`/:gameId`)
   - `apps/platform/src/sections/Game/Game.tsx` (loads by `GAMES.find(g => g.id === gameId)`)

Your `id` in `GAMES` is both:

- the URL slug
- the metadata game identifier used by recent plays parsing

## 5. Required UI pattern (`Portal` targets)

Games should render through `GambaUi.Portal`:

- `target="screen"`: main game area/canvas
- `target="controls"`: wager + side selectors + secondary actions
- `GambaUi.PlayButton` renders to `target="play"` area

Reference:

- `apps/platform/src/sections/Game/Game.tsx`

Minimal singleplayer skeleton:

```tsx
import { GambaUi, useWagerInput } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'

export default function MyGame() {
  const game = GambaUi.useGame()
  const gamba = useGamba()
  const [wager, setWager] = useWagerInput()

  const play = async () => {
    await game.play({
      wager,
      bet: [2, 0],
      metadata: ['heads'],
    })
    const result = await game.result()
    console.log(result.resultIndex, result.payout)
  }

  return (
    <>
      <GambaUi.Portal target="screen">{/* game visuals */}</GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput value={wager} onChange={setWager} />
        <GambaUi.PlayButton disabled={gamba.isPlaying} onClick={play}>
          Play
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  )
}
```

Note: `PlayButton` does not auto-disable by `isPlaying`; pass `disabled` yourself when needed.

## 6. Metadata convention in this repo

The UI wrapper converts:

- input: `metadata: ['heads']`
- final string in tx: `0:<gameId>:heads`

Decoded in:

- `apps/platform/src/utils.ts` (`extractMetadata`)

If your game depends on custom metadata:

- keep it short and deterministic
- prefer primitive tokens (`string | number`)
- keep parser assumptions stable if you use it in Recent Plays or sharing UIs

## 7. Practical guardrails for game math

- Keep wager in atomic units.
- Compute and enforce `maxPayout <= pool.maxPayout` (see `Dice`, `Roulette`, `HiLo`, `Slots` patterns).
- For dynamic arrays, avoid float drift; normalize the sum back to `<= length`.
- Use `resultIndex` when UI needs exact slot/card/bin mapping.
- Use `result.payout > 0` only for simple win/loss UX.

## 8. Current singleplayer game patterns in this repo

### Flip (`apps/platform/src/games/Flip/index.tsx`)

- Heads: `[2, 0]`
- Tails: `[0, 2]`
- Uses `resultIndex` for coin face animation.
- Passes side metadata (`metadata: [side]`).

### Dice (`apps/platform/src/games/Dice/index.tsx`)

- Builds arrays from odds via `outcomes(odds)`.
- Uses GCD-based array sizing.
- Adjusts if float rounding pushes total above length.

### Slots (`apps/platform/src/games/Slots/index.tsx`, `utils.ts`)

- `generateBetArray(maxPayout, wager, maxLength=50)`.
- Caps by `maxMultiplier = min(maxLength, maxPayout / wager)`.
- Uses result multiplier to reveal matching symbol combination.

### HiLo (`apps/platform/src/games/HiLo/index.tsx`)

- Outcome space is card ranks.
- Builds hi/lo arrays from current rank.
- Uses `adjustBetArray` to keep total within constraints.

### Mines (`apps/platform/src/games/Mines/index.tsx`)

- Per-level array:
  - `remainingCells = GRID_SIZE - level`
  - winning multiplier `remainingCells / (remainingCells - mines)`
  - `bet = [0...mine slots, multiplier...safe slots]`
- Uses metadata with current level.

### Roulette (`apps/platform/src/games/Roulette/index.tsx`, `signals.ts`)

- Converts chip placements to per-number weights.
- Normalizes to final `bet` array over table numbers.
- Uses `resultIndex` to append spin history.

### Plinko (`apps/platform/src/games/Plinko/index.tsx`)

- Normal bet array: length 66, sum 66
- Degen bet array: length 49, sum 49
- Uses local physics sim, driven by result multiplier.

### Crash (`apps/platform/src/games/CrashGame/index.tsx`, `utils.ts`)

- `calculateBetArray(targetMultiplier)` builds repeated multiplier + zeros.
- Designed so totals match array length for supported target increments.
- Uses win/loss to drive rocket animation and crash point UX.

### BlackJack (`apps/platform/src/games/BlackJack/index.tsx`)

- Fixed 17-outcome array:
  - two `2.5x`, six `2x`, nine `0x`
- Length 17, sum 17.
- Card visuals are generated client-side from payout bucket.

## 9. Multiplayer model (different from singleplayer arrays)

Multiplayer games do not submit `bet` arrays per round.

They use multiplayer game accounts and lifecycle actions:

- create lobby
- join
- optionally edit bet
- leave
- settle and read winners

Main APIs:

- `packages/react/src/multiplayer/useMultiplayer.ts`
- `packages/react/src/multiplayer/useSpecificGames.ts`
- `packages/react/src/multiplayer/useGame.ts`
- UI helpers in `packages/react-ui/src/multiplayer/*`

## 10. Multiplayer lifecycle in this repo

Typical flow:

1. List/filter lobbies with `useSpecificGames(filters, pollMs)`.
2. Open one lobby with `useGame(pubkey, { fetchMetadata: true })`.
3. Read state via `game.state.waiting | playing | settled`.
4. Read winners via `winnerIndexes`.
5. Render join/edit/leave controls based on state and wallet membership.

Current multiplayer game implementations:

- `apps/platform/src/games/Jackpot/*`
- `apps/platform/src/games/PlinkoRace/*`
- `apps/platform/src/games/PvpFlip/*`

## 11. Multiplayer wager modes used here

Create modals in this repo map wager type by index:

- `0` = `sameWager`
- `1` = `customWager`
- `2` = `betRange`

See:

- `apps/platform/src/games/PlinkoRace/components/CreateGameModal.tsx`
- `apps/platform/src/games/PvpFlip/components/CreateGameModal.tsx`

Always enforce bounds in UI when using ranges.

## 12. Multiplayer metadata pattern in this repo

`useMultiplayer.join/editBet` writes player metadata to a fixed 32-byte buffer.

Current uses:

- PvpFlip: side choice (`heads` / `tails`)
- PlinkoRace: optional display name

Keep metadata short, deterministic, and parseable.

## 13. New singleplayer game checklist

- Define outcome space size (`N`).
- Build `bet` with `sum <= N`.
- Keep wager in atomic units.
- Enforce pool max payout before enabling play.
- Use `GambaUi.Portal` targets correctly.
- Register game in `apps/platform/src/games/index.tsx`.
- Use metadata only when needed for UX/recent-play context.
- Handle disconnect and tx errors cleanly.

## 14. New multiplayer game checklist

- Define lobby shape:
  - `maxPlayers`
  - `winnersTarget`
  - `mint`
  - wager mode
- Build create/join/edit/leave controls.
- Subscribe to lobby account and metadata.
- Handle all states explicitly (`waiting`, `playing`, `settled`).
- Resolve UI result from `winnerIndexes`, not local guesses.
- Keep metadata payload compact.

## 15. Common mistakes

- Sending arrays where `sum(bet) > bet.length`.
- Forgetting that index selection is equal-probability.
- Mixing display units with atomic token units.
- Forgetting to cap max payout by pool limits.
- Forgetting to register game in `apps/platform/src/games/index.tsx`.
- Confusing `GambaUi.useGame()` (singleplayer runtime wrapper) with multiplayer `useGame(pubkey, opts)` hook from `gamba-react-v2`.

