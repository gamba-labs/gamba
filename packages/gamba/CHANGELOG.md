# gamba

## 0.5.2

### Patch Changes

- 76b9802: Fix fee calcualtion

## 0.5.1

### Patch Changes

- b7df72a: Export `PROGRAM_ID`, `MIN_BET` & `GambaError` constants

## 0.5.0

### Minor Changes

- 9b37996: Added a `deductFees` parameter to the `gamba.play` method. If set to true, fees to house treasury & creator address will be deducted from the wagered amount.

  Added result Promises to `gamba.init` & `gamba.close`.
