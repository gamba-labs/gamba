export type Gamba = {
  "version": "0.1.0",
  "name": "gamba",
  "instructions": [
    {
      "name": "gambaInitialize",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "gambaSetAuthority",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        }
      ],
      "args": [
        {
          "name": "authority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "gambaSetConfig",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        }
      ],
      "args": [
        {
          "name": "rngAddress",
          "type": "publicKey"
        },
        {
          "name": "gambaFee",
          "type": "u64"
        },
        {
          "name": "maxCreatorFee",
          "type": "u64"
        },
        {
          "name": "poolCreationFee",
          "type": "u64"
        },
        {
          "name": "antiSpamFee",
          "type": "u64"
        },
        {
          "name": "maxHouseEdge",
          "type": "u64"
        },
        {
          "name": "defaultPoolFee",
          "type": "u64"
        },
        {
          "name": "jackpotPayoutToUserBps",
          "type": "u64"
        },
        {
          "name": "jackpotPayoutToCreatorBps",
          "type": "u64"
        },
        {
          "name": "jackpotPayoutToPoolBps",
          "type": "u64"
        },
        {
          "name": "jackpotPayoutToGambaBps",
          "type": "u64"
        },
        {
          "name": "bonusToJackpotRatioBps",
          "type": "u64"
        },
        {
          "name": "maxPayoutBps",
          "type": "u64"
        },
        {
          "name": "poolWithdrawFeeBps",
          "type": "u64"
        },
        {
          "name": "poolCreationAllowed",
          "type": "bool"
        },
        {
          "name": "poolDepositAllowed",
          "type": "bool"
        },
        {
          "name": "poolWithdrawAllowed",
          "type": "bool"
        },
        {
          "name": "playingAllowed",
          "type": "bool"
        },
        {
          "name": "distributionRecipient",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "poolInitialize",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "underlying_token_mint"
              },
              {
                "kind": "arg",
                "type": "publicKey",
                "path": "pool_authority"
              }
            ]
          }
        },
        {
          "name": "poolUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_ATA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "poolBonusUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_UNDERLYING_TA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "poolJackpotTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_JACKPOT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "gambaStateAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_LP_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "lpMintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonusMint",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "bonusMintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "poolAuthority",
          "type": "publicKey"
        },
        {
          "name": "lookupAddress",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "poolDeposit",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_ATA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_LP_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userUnderlyingAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userLpAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "poolWithdraw",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_ATA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_LP_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userUnderlyingAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userLpAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gambaState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "poolMintBonusTokens",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gambaState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolBonusUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_UNDERLYING_TA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "bonusMint",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "poolJackpotTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_JACKPOT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "userUnderlyingAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userBonusAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "poolAuthorityConfig",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "minWager",
          "type": "u64"
        },
        {
          "name": "depositLimit",
          "type": "bool"
        },
        {
          "name": "depositLimitAmount",
          "type": "u64"
        },
        {
          "name": "customPoolFee",
          "type": "bool"
        },
        {
          "name": "customPoolFeeBps",
          "type": "u64"
        },
        {
          "name": "customMexPayout",
          "type": "bool"
        },
        {
          "name": "customMaxPayoutBps",
          "type": "u64"
        },
        {
          "name": "depositWhitelistRequired",
          "type": "bool"
        },
        {
          "name": "depositWhitelistAddress",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "poolGambaConfig",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "antiSpamFeeExemption",
          "type": "bool"
        },
        {
          "name": "customGambaFee",
          "type": "bool"
        },
        {
          "name": "customGambaFeeBps",
          "type": "u64"
        }
      ]
    },
    {
      "name": "playerInitialize",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "PLAYER"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAME"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "playGame",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "PLAYER"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAME"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bonusTokenMint",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "userUnderlyingAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerBonusAta",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userBonusAta",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "poolJackpotTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_JACKPOT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "wager",
          "type": "u64"
        },
        {
          "name": "bet",
          "type": {
            "vec": "u32"
          }
        },
        {
          "name": "clientSeed",
          "type": "string"
        },
        {
          "name": "creatorFeeBps",
          "type": "u32"
        },
        {
          "name": "jackpotFeeBps",
          "type": "u32"
        },
        {
          "name": "metadata",
          "type": "string"
        }
      ]
    },
    {
      "name": "playerClose",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "PLAYER"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAME"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "playerClaim",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "PLAYER"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAME"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "playerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userUnderlyingAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "rngSettle",
      "accounts": [
        {
          "name": "rng",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "PLAYER"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAME"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_ATA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "poolBonusUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_UNDERLYING_TA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "playerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userUnderlyingAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gambaState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "gambaStateAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonusTokenMint",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "playerBonusAta",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "poolJackpotTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_JACKPOT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "ESCROW"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Player",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rngSeed",
          "type": "string"
        },
        {
          "name": "nextRngSeedHashed",
          "type": "string"
        }
      ]
    },
    {
      "name": "rngProvideHashedSeed",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rng",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "nextRngSeedHashed",
          "type": "string"
        }
      ]
    },
    {
      "name": "distributeFees",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "gambaStateAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionRecipient",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionRecipientAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nativeSol",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": {
              "defined": "GameStatus"
            }
          },
          {
            "name": "nextRngSeedHashed",
            "docs": [
              "SHA256 of coming rng_seed. Available at start of the game"
            ],
            "type": "string"
          },
          {
            "name": "rngSeed",
            "docs": [
              "Is revealed by the RNG after a play"
            ],
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "creatorMeta",
            "type": "string"
          },
          {
            "name": "wager",
            "type": "u64"
          },
          {
            "name": "underlyingUsed",
            "type": "u64"
          },
          {
            "name": "bonusUsed",
            "type": "u64"
          },
          {
            "name": "creatorFee",
            "type": "u64"
          },
          {
            "name": "gambaFee",
            "type": "u64"
          },
          {
            "name": "poolFee",
            "type": "u64"
          },
          {
            "name": "jackpotFee",
            "type": "u64"
          },
          {
            "name": "jackpotResult",
            "type": "u64"
          },
          {
            "name": "jackpotProbabilityUbps",
            "type": "u64"
          },
          {
            "name": "jackpotPayout",
            "type": "u64"
          },
          {
            "name": "clientSeed",
            "type": "string"
          },
          {
            "name": "bet",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "result",
            "type": "u64"
          },
          {
            "name": "points",
            "type": "bool"
          },
          {
            "name": "pointsAuthority",
            "type": "publicKey"
          },
          {
            "name": "metadata",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "nonce",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "lookupAddress",
            "type": "publicKey"
          },
          {
            "name": "poolAuthority",
            "type": "publicKey"
          },
          {
            "name": "underlyingTokenMint",
            "type": "publicKey"
          },
          {
            "name": "antiSpamFeeExempt",
            "type": "bool"
          },
          {
            "name": "minWager",
            "type": "u64"
          },
          {
            "name": "plays",
            "type": "u64"
          },
          {
            "name": "liquidityCheckpoint",
            "type": "u64"
          },
          {
            "name": "depositLimit",
            "type": "bool"
          },
          {
            "name": "depositLimitAmount",
            "type": "u64"
          },
          {
            "name": "customPoolFee",
            "type": "bool"
          },
          {
            "name": "customPoolFeeBps",
            "type": "u64"
          },
          {
            "name": "customGambaFee",
            "type": "bool"
          },
          {
            "name": "customGambaFeeBps",
            "type": "u64"
          },
          {
            "name": "customMaxPayout",
            "type": "bool"
          },
          {
            "name": "customMaxPayoutBps",
            "type": "u64"
          },
          {
            "name": "customBonusTokenMint",
            "type": "publicKey"
          },
          {
            "name": "customBonusToken",
            "type": "bool"
          },
          {
            "name": "customMaxCreatorFee",
            "type": "bool"
          },
          {
            "name": "customMaxCreatorFeeBps",
            "type": "u64"
          },
          {
            "name": "depositWhitelistRequired",
            "type": "bool"
          },
          {
            "name": "depositWhitelistAddress",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "gambaState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "rngAddress",
            "type": "publicKey"
          },
          {
            "name": "rngAddress2",
            "type": "publicKey"
          },
          {
            "name": "antiSpamFee",
            "type": "u64"
          },
          {
            "name": "gambaFeeBps",
            "type": "u64"
          },
          {
            "name": "poolCreationFee",
            "type": "u64"
          },
          {
            "name": "defaultPoolFee",
            "type": "u64"
          },
          {
            "name": "jackpotPayoutToUserBps",
            "type": "u64"
          },
          {
            "name": "jackpotPayoutToCreatorBps",
            "type": "u64"
          },
          {
            "name": "jackpotPayoutToPoolBps",
            "type": "u64"
          },
          {
            "name": "jackpotPayoutToGambaBps",
            "type": "u64"
          },
          {
            "name": "bonusToJackpotRatioBps",
            "type": "u64"
          },
          {
            "name": "maxHouseEdgeBps",
            "type": "u64"
          },
          {
            "name": "maxCreatorFeeBps",
            "type": "u64"
          },
          {
            "name": "maxPayoutBps",
            "type": "u64"
          },
          {
            "name": "poolWithdrawFeeBps",
            "type": "u64"
          },
          {
            "name": "poolCreationAllowed",
            "type": "bool"
          },
          {
            "name": "poolDepositAllowed",
            "type": "bool"
          },
          {
            "name": "poolWithdrawAllowed",
            "type": "bool"
          },
          {
            "name": "playingAllowed",
            "type": "bool"
          },
          {
            "name": "distributionRecipient",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PlayerError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "NotReadyToPlay"
          },
          {
            "name": "CreatorFeeTooHigh"
          },
          {
            "name": "WagerTooSmall"
          },
          {
            "name": "TooFewBetOutcomes"
          },
          {
            "name": "TooManyBetOutcomes"
          },
          {
            "name": "PlayerAdvantage"
          },
          {
            "name": "HouseAdvantageTooHigh"
          },
          {
            "name": "MaxPayoutExceeded"
          }
        ]
      }
    },
    {
      "name": "RngError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Generic"
          },
          {
            "name": "InitialHashedSeedAlreadyProvided"
          },
          {
            "name": "IncorrectRngSeed"
          },
          {
            "name": "ResultNotRequested"
          }
        ]
      }
    },
    {
      "name": "GambaStateError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "PlaysNotAllowed"
          },
          {
            "name": "DepositNotAllowed"
          },
          {
            "name": "WithdrawalNotAllowed"
          },
          {
            "name": "PoolCreationNotAllowed"
          },
          {
            "name": "DepositLimitExceeded"
          },
          {
            "name": "DepositWhitelistRequired"
          }
        ]
      }
    },
    {
      "name": "PoolAction",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Deposit"
          },
          {
            "name": "Withdraw"
          }
        ]
      }
    },
    {
      "name": "GameStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "NotInitialized"
          },
          {
            "name": "Ready"
          },
          {
            "name": "ResultRequested"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "GameSettled",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "creator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "creatorFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "gambaFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "poolFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "jackpotFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "underlyingUsed",
          "type": "u64",
          "index": false
        },
        {
          "name": "bonusUsed",
          "type": "u64",
          "index": false
        },
        {
          "name": "wager",
          "type": "u64",
          "index": false
        },
        {
          "name": "payout",
          "type": "u64",
          "index": false
        },
        {
          "name": "multiplierBps",
          "type": "u32",
          "index": false
        },
        {
          "name": "payoutFromBonusPool",
          "type": "u64",
          "index": false
        },
        {
          "name": "payoutFromNormalPool",
          "type": "u64",
          "index": false
        },
        {
          "name": "jackpotProbabilityUbps",
          "type": "u64",
          "index": false
        },
        {
          "name": "jackpotResult",
          "type": "u64",
          "index": false
        },
        {
          "name": "nonce",
          "type": "u64",
          "index": false
        },
        {
          "name": "clientSeed",
          "type": "string",
          "index": false
        },
        {
          "name": "resultIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "bet",
          "type": {
            "vec": "u32"
          },
          "index": false
        },
        {
          "name": "jackpotPayoutToUser",
          "type": "u64",
          "index": false
        },
        {
          "name": "poolLiquidity",
          "type": "u64",
          "index": false
        },
        {
          "name": "rngSeed",
          "type": "string",
          "index": false
        },
        {
          "name": "nextRngSeedHashed",
          "type": "string",
          "index": false
        },
        {
          "name": "metadata",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "PoolChange",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "action",
          "type": {
            "defined": "PoolAction"
          },
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "postLiquidity",
          "type": "u64",
          "index": false
        },
        {
          "name": "lpSupply",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GenericError",
      "msg": "Something went wrong"
    },
    {
      "code": 6001,
      "name": "Unauthorized",
      "msg": "Unauthorized"
    }
  ]
};

export const IDL: Gamba = {
  "version": "0.1.0",
  "name": "gamba",
  "instructions": [
    {
      "name": "gambaInitialize",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "gambaSetAuthority",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        }
      ],
      "args": [
        {
          "name": "authority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "gambaSetConfig",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        }
      ],
      "args": [
        {
          "name": "rngAddress",
          "type": "publicKey"
        },
        {
          "name": "gambaFee",
          "type": "u64"
        },
        {
          "name": "maxCreatorFee",
          "type": "u64"
        },
        {
          "name": "poolCreationFee",
          "type": "u64"
        },
        {
          "name": "antiSpamFee",
          "type": "u64"
        },
        {
          "name": "maxHouseEdge",
          "type": "u64"
        },
        {
          "name": "defaultPoolFee",
          "type": "u64"
        },
        {
          "name": "jackpotPayoutToUserBps",
          "type": "u64"
        },
        {
          "name": "jackpotPayoutToCreatorBps",
          "type": "u64"
        },
        {
          "name": "jackpotPayoutToPoolBps",
          "type": "u64"
        },
        {
          "name": "jackpotPayoutToGambaBps",
          "type": "u64"
        },
        {
          "name": "bonusToJackpotRatioBps",
          "type": "u64"
        },
        {
          "name": "maxPayoutBps",
          "type": "u64"
        },
        {
          "name": "poolWithdrawFeeBps",
          "type": "u64"
        },
        {
          "name": "poolCreationAllowed",
          "type": "bool"
        },
        {
          "name": "poolDepositAllowed",
          "type": "bool"
        },
        {
          "name": "poolWithdrawAllowed",
          "type": "bool"
        },
        {
          "name": "playingAllowed",
          "type": "bool"
        },
        {
          "name": "distributionRecipient",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "poolInitialize",
      "accounts": [
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Mint",
                "path": "underlying_token_mint"
              },
              {
                "kind": "arg",
                "type": "publicKey",
                "path": "pool_authority"
              }
            ]
          }
        },
        {
          "name": "poolUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_ATA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "poolBonusUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_UNDERLYING_TA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "poolJackpotTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_JACKPOT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "gambaStateAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_LP_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "lpMintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonusMint",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "bonusMintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "poolAuthority",
          "type": "publicKey"
        },
        {
          "name": "lookupAddress",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "poolDeposit",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_ATA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_LP_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userUnderlyingAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userLpAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "poolWithdraw",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_ATA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "lpMint",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_LP_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userUnderlyingAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userLpAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gambaState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "poolMintBonusTokens",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gambaState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolBonusUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_UNDERLYING_TA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "bonusMint",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "poolJackpotTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_JACKPOT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "userUnderlyingAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userBonusAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "poolAuthorityConfig",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "minWager",
          "type": "u64"
        },
        {
          "name": "depositLimit",
          "type": "bool"
        },
        {
          "name": "depositLimitAmount",
          "type": "u64"
        },
        {
          "name": "customPoolFee",
          "type": "bool"
        },
        {
          "name": "customPoolFeeBps",
          "type": "u64"
        },
        {
          "name": "customMexPayout",
          "type": "bool"
        },
        {
          "name": "customMaxPayoutBps",
          "type": "u64"
        },
        {
          "name": "depositWhitelistRequired",
          "type": "bool"
        },
        {
          "name": "depositWhitelistAddress",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "poolGambaConfig",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "antiSpamFeeExemption",
          "type": "bool"
        },
        {
          "name": "customGambaFee",
          "type": "bool"
        },
        {
          "name": "customGambaFeeBps",
          "type": "u64"
        }
      ]
    },
    {
      "name": "playerInitialize",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "PLAYER"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAME"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "playGame",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "PLAYER"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAME"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bonusTokenMint",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "userUnderlyingAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerBonusAta",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userBonusAta",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "poolJackpotTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_JACKPOT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "wager",
          "type": "u64"
        },
        {
          "name": "bet",
          "type": {
            "vec": "u32"
          }
        },
        {
          "name": "clientSeed",
          "type": "string"
        },
        {
          "name": "creatorFeeBps",
          "type": "u32"
        },
        {
          "name": "jackpotFeeBps",
          "type": "u32"
        },
        {
          "name": "metadata",
          "type": "string"
        }
      ]
    },
    {
      "name": "playerClose",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "PLAYER"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAME"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "playerClaim",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "PLAYER"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAME"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "playerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userUnderlyingAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "rngSettle",
      "accounts": [
        {
          "name": "rng",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "PLAYER"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAME"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_ATA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "poolBonusUnderlyingTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_UNDERLYING_TA"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "playerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userUnderlyingAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gambaState",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "gambaStateAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonusTokenMint",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_BONUS_MINT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "playerBonusAta",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "poolJackpotTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "POOL_JACKPOT"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Pool",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "ESCROW"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Player",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rngSeed",
          "type": "string"
        },
        {
          "name": "nextRngSeedHashed",
          "type": "string"
        }
      ]
    },
    {
      "name": "rngProvideHashedSeed",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rng",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "nextRngSeedHashed",
          "type": "string"
        }
      ]
    },
    {
      "name": "distributeFees",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "underlyingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "GAMBA_STATE"
              }
            ]
          }
        },
        {
          "name": "gambaStateAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionRecipient",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionRecipientAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nativeSol",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": {
              "defined": "GameStatus"
            }
          },
          {
            "name": "nextRngSeedHashed",
            "docs": [
              "SHA256 of coming rng_seed. Available at start of the game"
            ],
            "type": "string"
          },
          {
            "name": "rngSeed",
            "docs": [
              "Is revealed by the RNG after a play"
            ],
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "creatorMeta",
            "type": "string"
          },
          {
            "name": "wager",
            "type": "u64"
          },
          {
            "name": "underlyingUsed",
            "type": "u64"
          },
          {
            "name": "bonusUsed",
            "type": "u64"
          },
          {
            "name": "creatorFee",
            "type": "u64"
          },
          {
            "name": "gambaFee",
            "type": "u64"
          },
          {
            "name": "poolFee",
            "type": "u64"
          },
          {
            "name": "jackpotFee",
            "type": "u64"
          },
          {
            "name": "jackpotResult",
            "type": "u64"
          },
          {
            "name": "jackpotProbabilityUbps",
            "type": "u64"
          },
          {
            "name": "jackpotPayout",
            "type": "u64"
          },
          {
            "name": "clientSeed",
            "type": "string"
          },
          {
            "name": "bet",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "result",
            "type": "u64"
          },
          {
            "name": "points",
            "type": "bool"
          },
          {
            "name": "pointsAuthority",
            "type": "publicKey"
          },
          {
            "name": "metadata",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "nonce",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "lookupAddress",
            "type": "publicKey"
          },
          {
            "name": "poolAuthority",
            "type": "publicKey"
          },
          {
            "name": "underlyingTokenMint",
            "type": "publicKey"
          },
          {
            "name": "antiSpamFeeExempt",
            "type": "bool"
          },
          {
            "name": "minWager",
            "type": "u64"
          },
          {
            "name": "plays",
            "type": "u64"
          },
          {
            "name": "liquidityCheckpoint",
            "type": "u64"
          },
          {
            "name": "depositLimit",
            "type": "bool"
          },
          {
            "name": "depositLimitAmount",
            "type": "u64"
          },
          {
            "name": "customPoolFee",
            "type": "bool"
          },
          {
            "name": "customPoolFeeBps",
            "type": "u64"
          },
          {
            "name": "customGambaFee",
            "type": "bool"
          },
          {
            "name": "customGambaFeeBps",
            "type": "u64"
          },
          {
            "name": "customMaxPayout",
            "type": "bool"
          },
          {
            "name": "customMaxPayoutBps",
            "type": "u64"
          },
          {
            "name": "customBonusTokenMint",
            "type": "publicKey"
          },
          {
            "name": "customBonusToken",
            "type": "bool"
          },
          {
            "name": "customMaxCreatorFee",
            "type": "bool"
          },
          {
            "name": "customMaxCreatorFeeBps",
            "type": "u64"
          },
          {
            "name": "depositWhitelistRequired",
            "type": "bool"
          },
          {
            "name": "depositWhitelistAddress",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "gambaState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "rngAddress",
            "type": "publicKey"
          },
          {
            "name": "rngAddress2",
            "type": "publicKey"
          },
          {
            "name": "antiSpamFee",
            "type": "u64"
          },
          {
            "name": "gambaFeeBps",
            "type": "u64"
          },
          {
            "name": "poolCreationFee",
            "type": "u64"
          },
          {
            "name": "defaultPoolFee",
            "type": "u64"
          },
          {
            "name": "jackpotPayoutToUserBps",
            "type": "u64"
          },
          {
            "name": "jackpotPayoutToCreatorBps",
            "type": "u64"
          },
          {
            "name": "jackpotPayoutToPoolBps",
            "type": "u64"
          },
          {
            "name": "jackpotPayoutToGambaBps",
            "type": "u64"
          },
          {
            "name": "bonusToJackpotRatioBps",
            "type": "u64"
          },
          {
            "name": "maxHouseEdgeBps",
            "type": "u64"
          },
          {
            "name": "maxCreatorFeeBps",
            "type": "u64"
          },
          {
            "name": "maxPayoutBps",
            "type": "u64"
          },
          {
            "name": "poolWithdrawFeeBps",
            "type": "u64"
          },
          {
            "name": "poolCreationAllowed",
            "type": "bool"
          },
          {
            "name": "poolDepositAllowed",
            "type": "bool"
          },
          {
            "name": "poolWithdrawAllowed",
            "type": "bool"
          },
          {
            "name": "playingAllowed",
            "type": "bool"
          },
          {
            "name": "distributionRecipient",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PlayerError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "NotReadyToPlay"
          },
          {
            "name": "CreatorFeeTooHigh"
          },
          {
            "name": "WagerTooSmall"
          },
          {
            "name": "TooFewBetOutcomes"
          },
          {
            "name": "TooManyBetOutcomes"
          },
          {
            "name": "PlayerAdvantage"
          },
          {
            "name": "HouseAdvantageTooHigh"
          },
          {
            "name": "MaxPayoutExceeded"
          }
        ]
      }
    },
    {
      "name": "RngError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Generic"
          },
          {
            "name": "InitialHashedSeedAlreadyProvided"
          },
          {
            "name": "IncorrectRngSeed"
          },
          {
            "name": "ResultNotRequested"
          }
        ]
      }
    },
    {
      "name": "GambaStateError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "PlaysNotAllowed"
          },
          {
            "name": "DepositNotAllowed"
          },
          {
            "name": "WithdrawalNotAllowed"
          },
          {
            "name": "PoolCreationNotAllowed"
          },
          {
            "name": "DepositLimitExceeded"
          },
          {
            "name": "DepositWhitelistRequired"
          }
        ]
      }
    },
    {
      "name": "PoolAction",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Deposit"
          },
          {
            "name": "Withdraw"
          }
        ]
      }
    },
    {
      "name": "GameStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "NotInitialized"
          },
          {
            "name": "Ready"
          },
          {
            "name": "ResultRequested"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "GameSettled",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "creator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "creatorFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "gambaFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "poolFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "jackpotFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "underlyingUsed",
          "type": "u64",
          "index": false
        },
        {
          "name": "bonusUsed",
          "type": "u64",
          "index": false
        },
        {
          "name": "wager",
          "type": "u64",
          "index": false
        },
        {
          "name": "payout",
          "type": "u64",
          "index": false
        },
        {
          "name": "multiplierBps",
          "type": "u32",
          "index": false
        },
        {
          "name": "payoutFromBonusPool",
          "type": "u64",
          "index": false
        },
        {
          "name": "payoutFromNormalPool",
          "type": "u64",
          "index": false
        },
        {
          "name": "jackpotProbabilityUbps",
          "type": "u64",
          "index": false
        },
        {
          "name": "jackpotResult",
          "type": "u64",
          "index": false
        },
        {
          "name": "nonce",
          "type": "u64",
          "index": false
        },
        {
          "name": "clientSeed",
          "type": "string",
          "index": false
        },
        {
          "name": "resultIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "bet",
          "type": {
            "vec": "u32"
          },
          "index": false
        },
        {
          "name": "jackpotPayoutToUser",
          "type": "u64",
          "index": false
        },
        {
          "name": "poolLiquidity",
          "type": "u64",
          "index": false
        },
        {
          "name": "rngSeed",
          "type": "string",
          "index": false
        },
        {
          "name": "nextRngSeedHashed",
          "type": "string",
          "index": false
        },
        {
          "name": "metadata",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "PoolChange",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tokenMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "action",
          "type": {
            "defined": "PoolAction"
          },
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "postLiquidity",
          "type": "u64",
          "index": false
        },
        {
          "name": "lpSupply",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GenericError",
      "msg": "Something went wrong"
    },
    {
      "code": 6001,
      "name": "Unauthorized",
      "msg": "Unauthorized"
    }
  ]
};
