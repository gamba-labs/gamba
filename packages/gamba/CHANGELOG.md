# gamba

## 0.6.4

### Patch Changes

- 4dba6d4: Fixed exports
- Updated dependencies [4dba6d4]
  - gamba-core@0.2.1
  - gamba-react@0.1.2
  - gamba-react-ui@0.1.2

## 0.6.3

### Patch Changes

- bef5575: Nested packages

## 0.6.2

### Patch Changes

- 0c09ba0: Nested packages

## 0.6.1

### Patch Changes

- 2cb2cad: Version fix
- Updated dependencies [2cb2cad]
  - gamba-react@0.1.1
  - gamba-react-ui@0.1.1

## 1.0.0

### Minor Changes

- e76b7c6: Split up packages into `gamba-core`, `gamba-react` & `gamba-react-ui`

  The main `gamba` package contains the core package and nested `gamba/react` & `gamba/react-ui`

### Patch Changes

- Updated dependencies [e76b7c6]
  - gamba-core@0.2.0
  - gamba-react@1.0.0
  - gamba-react-ui@1.0.0

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
