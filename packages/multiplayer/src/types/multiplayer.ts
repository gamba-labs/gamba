/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/multiplayer.json`.
 */
export type Multiplayer = {
  "address": "gambaMhWCfgqqBrc1KiEB4iBJnFG1RhQu2oFX6LV5xq",
  "metadata": {
    "name": "multiplayer",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createGameNative",
      "discriminator": [
        14,
        237,
        122,
        202,
        102,
        88,
        48,
        75
      ],
      "accounts": [
        {
          "name": "gameAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  65,
                  77,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "gamba_state.game_id",
                "account": "gambaState"
              }
            ]
          }
        },
        {
          "name": "mint",
          "docs": [
            "always SOL (placeholder mint)"
          ]
        },
        {
          "name": "gameMaker",
          "writable": true,
          "signer": true
        },
        {
          "name": "gambaState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  65,
                  77,
                  66,
                  65,
                  95,
                  83,
                  84,
                  65,
                  84,
                  69
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "preAllocPlayers",
          "type": "u16"
        },
        {
          "name": "maxPlayers",
          "type": "u16"
        },
        {
          "name": "numTeams",
          "type": "u8"
        },
        {
          "name": "winnersTarget",
          "type": "u16"
        },
        {
          "name": "wagerType",
          "type": "u8"
        },
        {
          "name": "payoutType",
          "type": "u8"
        },
        {
          "name": "wager",
          "type": "u64"
        },
        {
          "name": "softDuration",
          "type": "i64"
        },
        {
          "name": "hardDuration",
          "type": "i64"
        }
      ]
    },
    {
      "name": "createGameSpl",
      "discriminator": [
        80,
        235,
        44,
        243,
        14,
        15,
        248,
        207
      ],
      "accounts": [
        {
          "name": "gameAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  65,
                  77,
                  69
                ]
              },
              {
                "kind": "account",
                "path": "gamba_state.game_id",
                "account": "gambaState"
              }
            ]
          }
        },
        {
          "name": "mint",
          "docs": [
            "the SPL mint for wagers"
          ]
        },
        {
          "name": "gameAccountTaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "gameAccount"
              }
            ]
          }
        },
        {
          "name": "gameMaker",
          "writable": true,
          "signer": true
        },
        {
          "name": "gambaState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  65,
                  77,
                  66,
                  65,
                  95,
                  83,
                  84,
                  65,
                  84,
                  69
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "preAllocPlayers",
          "type": "u16"
        },
        {
          "name": "maxPlayers",
          "type": "u16"
        },
        {
          "name": "numTeams",
          "type": "u8"
        },
        {
          "name": "winnersTarget",
          "type": "u16"
        },
        {
          "name": "wagerType",
          "type": "u8"
        },
        {
          "name": "payoutType",
          "type": "u8"
        },
        {
          "name": "wager",
          "type": "u64"
        },
        {
          "name": "softDuration",
          "type": "i64"
        },
        {
          "name": "hardDuration",
          "type": "i64"
        }
      ]
    },
    {
      "name": "distributeNative",
      "discriminator": [
        32,
        200,
        172,
        49,
        57,
        234,
        137,
        89
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "The signer who calls this (doesn’t actually pay anything unless closing)."
          ],
          "signer": true
        },
        {
          "name": "gambaState",
          "docs": [
            "Global configuration account (V1). Used to check `gamba_fee_address`."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  65,
                  77,
                  66,
                  65,
                  95,
                  83,
                  84,
                  65,
                  84,
                  69
                ]
              }
            ]
          }
        },
        {
          "name": "gameAccount",
          "docs": [
            "Raw Game account; we will parse all fields “by hand” to avoid heap blowup."
          ],
          "writable": true
        },
        {
          "name": "gameMaker",
          "docs": [
            "This is the “game maker” address. If we close the PDA, any leftover lamports go here."
          ],
          "writable": true
        },
        {
          "name": "gambaFeeAddress",
          "docs": [
            "Protocol vault: collects “pending_gamba_fee” and any “dust” from closed accounts."
          ],
          "writable": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "Standard System program."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "distributeSpl",
      "discriminator": [
        93,
        24,
        158,
        238,
        198,
        173,
        215,
        228
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "gambaState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  65,
                  77,
                  66,
                  65,
                  95,
                  83,
                  84,
                  65,
                  84,
                  69
                ]
              }
            ]
          }
        },
        {
          "name": "gameAccount",
          "writable": true
        },
        {
          "name": "gameAccountTa",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "gambaFeeAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "gambaFeeAddress"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "gambaFeeAddress",
          "writable": true
        },
        {
          "name": "gameMaker",
          "writable": true
        },
        {
          "name": "creatorAta0",
          "writable": true,
          "optional": true
        },
        {
          "name": "creatorAta1",
          "writable": true,
          "optional": true
        },
        {
          "name": "creatorAta2",
          "writable": true,
          "optional": true
        },
        {
          "name": "creatorAta3",
          "writable": true,
          "optional": true
        },
        {
          "name": "creatorAta4",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta0",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta1",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta2",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta3",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta4",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta5",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta6",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta7",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta8",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta9",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta10",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta11",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta12",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta13",
          "writable": true,
          "optional": true
        },
        {
          "name": "winnerAta14",
          "writable": true,
          "optional": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "gambaConfig",
      "discriminator": [
        232,
        208,
        249,
        92,
        159,
        187,
        21,
        254
      ],
      "accounts": [
        {
          "name": "gambaState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  65,
                  77,
                  66,
                  65,
                  95,
                  83,
                  84,
                  65,
                  84,
                  69
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "feeVault",
          "type": "pubkey"
        },
        {
          "name": "feeBps",
          "type": "u32"
        },
        {
          "name": "rng",
          "type": "pubkey"
        },
        {
          "name": "authority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "joinGame",
      "discriminator": [
        107,
        112,
        18,
        38,
        56,
        173,
        60,
        128
      ],
      "accounts": [
        {
          "name": "gameAccount",
          "docs": [
            "The on‐chain Game account as raw bytes (no automatic deserialization)."
          ],
          "writable": true
        },
        {
          "name": "gambaState",
          "docs": [
            "Global config; used for fee BPS."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  65,
                  77,
                  66,
                  65,
                  95,
                  83,
                  84,
                  65,
                  84,
                  69
                ]
              }
            ]
          }
        },
        {
          "name": "gameAccountTa",
          "docs": [
            "Optional escrow token account PDA."
          ],
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "gameAccount"
              }
            ]
          }
        },
        {
          "name": "mint",
          "docs": [
            "The mint for this game (native SOL or SPL)."
          ]
        },
        {
          "name": "playerAccount",
          "docs": [
            "The player joining (payer + signer)."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "playerAta",
          "docs": [
            "Optional player ATA for SPL wagers."
          ],
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "playerAccount"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorAddress",
          "docs": [
            "Creator/referrer address that collects a fee."
          ]
        },
        {
          "name": "creatorAta",
          "docs": [
            "Creator’s ATA (we init if needed)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creatorAddress"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "Programs"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "creatorFeeBps",
          "type": "u32"
        },
        {
          "name": "wager",
          "type": "u64"
        },
        {
          "name": "team",
          "type": "u8"
        }
      ]
    },
    {
      "name": "leaveGame",
      "discriminator": [
        218,
        226,
        6,
        0,
        243,
        34,
        125,
        201
      ],
      "accounts": [
        {
          "name": "gameAccount",
          "docs": [
            "Raw Game account; we’ll parse fields manually."
          ],
          "writable": true
        },
        {
          "name": "mint",
          "docs": [
            "The mint for this game (native SOL or SPL)."
          ]
        },
        {
          "name": "playerAccount",
          "docs": [
            "The player who wants to leave (payer + signer)."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "playerAta",
          "docs": [
            "Optional player ATA (only for SPL‐token games)."
          ],
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "playerAccount"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "gameAccountTa",
          "docs": [
            "Game’s ATA (only for SPL‐token games)."
          ],
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "gameAccount"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program (for native‐SOL transfers)."
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Associated‐Token program (for SPL transfers)."
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "docs": [
            "SPL‐Token program (for SPL transfers)."
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "selectWinners",
      "discriminator": [
        80,
        100,
        28,
        131,
        83,
        199,
        222,
        80
      ],
      "accounts": [
        {
          "name": "rng",
          "docs": [
            "Authorised RNG bot"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "gambaState",
          "docs": [
            "Global config – only used to enforce `rng` above"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  71,
                  65,
                  77,
                  66,
                  65,
                  95,
                  83,
                  84,
                  65,
                  84,
                  69
                ]
              }
            ]
          }
        },
        {
          "name": "gameAccount",
          "docs": [
            "Raw Game account; we parse all fields “by hand”"
          ],
          "writable": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "gambaState",
      "discriminator": [
        142,
        203,
        14,
        224,
        153,
        118,
        52,
        200
      ]
    },
    {
      "name": "game",
      "discriminator": [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18
      ]
    }
  ],
  "events": [
    {
      "name": "gameCreated",
      "discriminator": [
        218,
        25,
        150,
        94,
        177,
        112,
        96,
        2
      ]
    },
    {
      "name": "gameSettledPartial",
      "discriminator": [
        208,
        36,
        152,
        148,
        220,
        252,
        60,
        89
      ]
    },
    {
      "name": "playerJoined",
      "discriminator": [
        39,
        144,
        49,
        106,
        108,
        210,
        183,
        38
      ]
    },
    {
      "name": "playerLeft",
      "discriminator": [
        7,
        106,
        62,
        150,
        175,
        170,
        96,
        84
      ]
    },
    {
      "name": "winnersSelected",
      "discriminator": [
        28,
        151,
        185,
        12,
        70,
        199,
        73,
        58
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "playerAlreadyInGame",
      "msg": "Player is already in the game"
    },
    {
      "code": 6001,
      "name": "playerNotInGame",
      "msg": "Player is not in the game"
    },
    {
      "code": 6002,
      "name": "gameInProgress",
      "msg": "Game is already in progress"
    },
    {
      "code": 6003,
      "name": "invalidGameAccount",
      "msg": "Invalid game account"
    },
    {
      "code": 6004,
      "name": "cannotSettleYet",
      "msg": "Cannot settle yet"
    },
    {
      "code": 6005,
      "name": "authorityMismatch",
      "msg": "Signer / authority mismatch"
    },
    {
      "code": 6006,
      "name": "invalidInput",
      "msg": "Invalid input"
    },
    {
      "code": 6007,
      "name": "alreadySettled",
      "msg": "Game already settled"
    },
    {
      "code": 6008,
      "name": "numericalOverflow",
      "msg": "numerical overflow"
    },
    {
      "code": 6009,
      "name": "creatorMismatch",
      "msg": "Creator Missmatch"
    },
    {
      "code": 6010,
      "name": "playerMismatch",
      "msg": "player rmismatch"
    },
    {
      "code": 6011,
      "name": "gameFull",
      "msg": "Game is Full"
    }
  ],
  "types": [
    {
      "name": "creatorPending",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
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
            "name": "rng",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "gambaFeeAddress",
            "type": "pubkey"
          },
          {
            "name": "gambaFeeBps",
            "type": "u32"
          },
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "gameId",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gameMaker",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "gameType",
            "type": {
              "defined": {
                "name": "gameType"
              }
            }
          },
          {
            "name": "wagerType",
            "type": {
              "defined": {
                "name": "wagerType"
              }
            }
          },
          {
            "name": "payoutType",
            "type": {
              "defined": {
                "name": "payoutType"
              }
            }
          },
          {
            "name": "maxPlayers",
            "type": "u16"
          },
          {
            "name": "preAlloc",
            "type": "u16"
          },
          {
            "name": "numTeams",
            "type": "u8"
          },
          {
            "name": "winnersTarget",
            "type": "u16"
          },
          {
            "name": "wager",
            "type": "u64"
          },
          {
            "name": "softExpirationTimestamp",
            "type": "i64"
          },
          {
            "name": "hardExpirationTimestamp",
            "type": "i64"
          },
          {
            "name": "state",
            "type": {
              "defined": {
                "name": "gameState"
              }
            }
          },
          {
            "name": "pendingGambaFee",
            "type": "u64"
          },
          {
            "name": "gameId",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "players",
            "type": {
              "vec": {
                "defined": {
                  "name": "player"
                }
              }
            }
          },
          {
            "name": "winnerIndexes",
            "type": {
              "vec": "u16"
            }
          },
          {
            "name": "creatorsPending",
            "type": {
              "vec": {
                "defined": {
                  "name": "creatorPending"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "gameCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gameId",
            "type": "u64"
          },
          {
            "name": "gameAccount",
            "type": "pubkey"
          },
          {
            "name": "gameMaker",
            "type": "pubkey"
          },
          {
            "name": "maxPlayers",
            "type": "u16"
          },
          {
            "name": "numTeams",
            "type": "u8"
          },
          {
            "name": "gameType",
            "type": "u8"
          },
          {
            "name": "wagerType",
            "type": "u8"
          },
          {
            "name": "payoutType",
            "type": "u8"
          },
          {
            "name": "winnersTarget",
            "type": "u16"
          },
          {
            "name": "softDurationSeconds",
            "type": "i64"
          },
          {
            "name": "hardDurationSeconds",
            "type": "i64"
          },
          {
            "name": "softExpirationTimestamp",
            "type": "i64"
          },
          {
            "name": "hardExpirationTimestamp",
            "type": "i64"
          },
          {
            "name": "wager",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "gameSettledPartial",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gameId",
            "type": "u64"
          },
          {
            "name": "gameAccount",
            "type": "pubkey"
          },
          {
            "name": "creatorsLeft",
            "type": "u32"
          },
          {
            "name": "winnersLeft",
            "type": "u32"
          },
          {
            "name": "paidCreatorsThisTx",
            "type": "u32"
          },
          {
            "name": "paidWinnersThisTx",
            "type": "u32"
          },
          {
            "name": "amountPaid",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "gameState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "waiting"
          },
          {
            "name": "playing"
          },
          {
            "name": "settled"
          }
        ]
      }
    },
    {
      "name": "gameType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "individual"
          },
          {
            "name": "team"
          }
        ]
      }
    },
    {
      "name": "payoutType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "same"
          },
          {
            "name": "exponentialDecay"
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
            "name": "creatorAddress",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "creatorFeeAmount",
            "type": "u64"
          },
          {
            "name": "gambaFeeAmount",
            "type": "u64"
          },
          {
            "name": "wager",
            "type": "u64"
          },
          {
            "name": "pendingPayout",
            "type": "u64"
          },
          {
            "name": "team",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "playerJoined",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gameId",
            "type": "u64"
          },
          {
            "name": "gameAccount",
            "type": "pubkey"
          },
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "wager",
            "type": "u64"
          },
          {
            "name": "creatorFee",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "gameType",
            "type": "u8"
          },
          {
            "name": "team",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "playerLeft",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gameId",
            "type": "u64"
          },
          {
            "name": "gameAccount",
            "type": "pubkey"
          },
          {
            "name": "player",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "wagerType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "sameWager"
          },
          {
            "name": "customWager"
          }
        ]
      }
    },
    {
      "name": "winnersSelected",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gameId",
            "type": "u64"
          },
          {
            "name": "gameAccount",
            "type": "pubkey"
          },
          {
            "name": "gameMaker",
            "type": "pubkey"
          },
          {
            "name": "maxPlayers",
            "type": "u16"
          },
          {
            "name": "winnerIndexes",
            "type": {
              "vec": "u16"
            }
          },
          {
            "name": "winnerWagers",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "payouts",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "totalWager",
            "type": "u64"
          },
          {
            "name": "playersSample",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    }
  ]
};
