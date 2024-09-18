export type Multiplayer = {
  "version": "0.1.0",
  "name": "multiplayer",
  "instructions": [
    {
      "name": "createGame",
      "accounts": [
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gameAccountTaAccount",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "gameMaker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gambaFeeAddress",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gambaFeeAta",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
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
          "name": "maxPlayers",
          "type": "u8"
        },
        {
          "name": "winners",
          "type": "u8"
        },
        {
          "name": "wagerType",
          "type": "u8"
        },
        {
          "name": "wager",
          "type": "u64"
        },
        {
          "name": "softSettle",
          "type": "i64"
        },
        {
          "name": "hardSettle",
          "type": "i64"
        }
      ]
    },
    {
      "name": "joinGame",
      "accounts": [
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameAccountTa",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerAta",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creatorAddress",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
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
        }
      ],
      "args": [
        {
          "name": "creatorFee",
          "type": "u32"
        },
        {
          "name": "wager",
          "type": "u64"
        }
      ]
    },
    {
      "name": "leaveGame",
      "accounts": [
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameAccountTa",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerAta",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
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
        }
      ],
      "args": []
    },
    {
      "name": "settleGame",
      "accounts": [
        {
          "name": "rng",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameMaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameAccountTa",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gambaFeeAddress",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gambaFeeAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player1Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator1Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player2Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator2Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player3Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator3Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player4Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator4Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player5Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator5Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player6Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator6Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player7Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator7Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player8Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator8Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player9Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator9Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player10Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator10Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
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
        }
      ],
      "args": []
    },
    {
      "name": "settleGameNative",
      "accounts": [
        {
          "name": "rng",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameMaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gambaFeeAddress",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player1",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator1",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player2",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator2",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player3",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator3",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player4",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator4",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player5",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator5",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player6",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator6",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player7",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator7",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player8",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator8",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player9",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator9",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player10",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator10",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
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
      "name": "gambaConfig",
      "accounts": [
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gambaFeeAddress",
          "type": "publicKey"
        },
        {
          "name": "gambaFee",
          "type": "u32"
        },
        {
          "name": "rng",
          "type": "publicKey"
        },
        {
          "name": "authority",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gambaState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rng",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "gambaFeeAddress",
            "type": "publicKey"
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
            "type": "publicKey"
          },
          {
            "name": "state",
            "type": {
              "defined": "GameState"
            }
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "maxPlayers",
            "type": "u8"
          },
          {
            "name": "players",
            "type": {
              "vec": {
                "defined": "Player"
              }
            }
          },
          {
            "name": "winners",
            "type": "u8"
          },
          {
            "name": "gameId",
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
            "name": "wagerType",
            "type": {
              "defined": "WagerType"
            }
          },
          {
            "name": "wager",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creatorAddress",
            "type": "publicKey"
          },
          {
            "name": "user",
            "type": "publicKey"
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
          }
        ]
      }
    },
    {
      "name": "GameState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Waiting"
          },
          {
            "name": "Playing"
          }
        ]
      }
    },
    {
      "name": "WagerType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "SameWager"
          },
          {
            "name": "CustomWager"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "GameCreated",
      "fields": [
        {
          "name": "gameId",
          "type": "u64",
          "index": false
        },
        {
          "name": "gameAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "gameMaker",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "maxPlayers",
          "type": "u8",
          "index": false
        },
        {
          "name": "winners",
          "type": "u8",
          "index": false
        },
        {
          "name": "softDurationSeconds",
          "type": "i64",
          "index": false
        },
        {
          "name": "hardDurationSeconds",
          "type": "i64",
          "index": false
        },
        {
          "name": "softExpirationTimestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "hardExpirationTimestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "wagerType",
          "type": "u8",
          "index": false
        },
        {
          "name": "wager",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "PlayerJoined",
      "fields": [
        {
          "name": "gameId",
          "type": "u64",
          "index": false
        },
        {
          "name": "gameAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "wager",
          "type": "u64",
          "index": false
        },
        {
          "name": "creatorFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "PlayerLeft",
      "fields": [
        {
          "name": "gameId",
          "type": "u64",
          "index": false
        },
        {
          "name": "gameAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "GameSettled",
      "fields": [
        {
          "name": "gameId",
          "type": "u64",
          "index": false
        },
        {
          "name": "gameAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "players",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        },
        {
          "name": "winners",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        },
        {
          "name": "payouts",
          "type": {
            "vec": "u64"
          },
          "index": false
        },
        {
          "name": "totalWager",
          "type": "u64",
          "index": false
        },
        {
          "name": "totalGambaFee",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "PlayerAlreadyInGame",
      "msg": "Player is already in the game"
    },
    {
      "code": 6001,
      "name": "PlayerNotInGame",
      "msg": "Player is not in the game"
    },
    {
      "code": 6002,
      "name": "GameInProgress",
      "msg": "Game is already in progress"
    },
    {
      "code": 6003,
      "name": "InvalidGameAccount",
      "msg": "Invalid game account"
    },
    {
      "code": 6004,
      "name": "CannotSettleYet",
      "msg": "Cannot settle yet"
    },
    {
      "code": 6005,
      "name": "AuthorityMismatch",
      "msg": "Authority mismatch"
    }
  ]
};

export const IDL: Multiplayer = {
  "version": "0.1.0",
  "name": "multiplayer",
  "instructions": [
    {
      "name": "createGame",
      "accounts": [
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gameAccountTaAccount",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "gameMaker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gambaFeeAddress",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gambaFeeAta",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
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
          "name": "maxPlayers",
          "type": "u8"
        },
        {
          "name": "winners",
          "type": "u8"
        },
        {
          "name": "wagerType",
          "type": "u8"
        },
        {
          "name": "wager",
          "type": "u64"
        },
        {
          "name": "softSettle",
          "type": "i64"
        },
        {
          "name": "hardSettle",
          "type": "i64"
        }
      ]
    },
    {
      "name": "joinGame",
      "accounts": [
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameAccountTa",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerAta",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creatorAddress",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
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
        }
      ],
      "args": [
        {
          "name": "creatorFee",
          "type": "u32"
        },
        {
          "name": "wager",
          "type": "u64"
        }
      ]
    },
    {
      "name": "leaveGame",
      "accounts": [
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameAccountTa",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerAta",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
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
        }
      ],
      "args": []
    },
    {
      "name": "settleGame",
      "accounts": [
        {
          "name": "rng",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameMaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameAccountTa",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gambaFeeAddress",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gambaFeeAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player1Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator1Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player2Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator2Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player3Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator3Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player4Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator4Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player5Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator5Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player6Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator6Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player7Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator7Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player8Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator8Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player9Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator9Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player10Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator10Ata",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
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
        }
      ],
      "args": []
    },
    {
      "name": "settleGameNative",
      "accounts": [
        {
          "name": "rng",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameMaker",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gambaFeeAddress",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player1",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator1",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player2",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator2",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player3",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator3",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player4",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator4",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player5",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator5",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player6",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator6",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player7",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator7",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player8",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator8",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player9",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator9",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "player10",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "creator10",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
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
      "name": "gambaConfig",
      "accounts": [
        {
          "name": "gambaState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gambaFeeAddress",
          "type": "publicKey"
        },
        {
          "name": "gambaFee",
          "type": "u32"
        },
        {
          "name": "rng",
          "type": "publicKey"
        },
        {
          "name": "authority",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gambaState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rng",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "gambaFeeAddress",
            "type": "publicKey"
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
            "type": "publicKey"
          },
          {
            "name": "state",
            "type": {
              "defined": "GameState"
            }
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "maxPlayers",
            "type": "u8"
          },
          {
            "name": "players",
            "type": {
              "vec": {
                "defined": "Player"
              }
            }
          },
          {
            "name": "winners",
            "type": "u8"
          },
          {
            "name": "gameId",
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
            "name": "wagerType",
            "type": {
              "defined": "WagerType"
            }
          },
          {
            "name": "wager",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creatorAddress",
            "type": "publicKey"
          },
          {
            "name": "user",
            "type": "publicKey"
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
          }
        ]
      }
    },
    {
      "name": "GameState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Waiting"
          },
          {
            "name": "Playing"
          }
        ]
      }
    },
    {
      "name": "WagerType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "SameWager"
          },
          {
            "name": "CustomWager"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "GameCreated",
      "fields": [
        {
          "name": "gameId",
          "type": "u64",
          "index": false
        },
        {
          "name": "gameAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "gameMaker",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "maxPlayers",
          "type": "u8",
          "index": false
        },
        {
          "name": "winners",
          "type": "u8",
          "index": false
        },
        {
          "name": "softDurationSeconds",
          "type": "i64",
          "index": false
        },
        {
          "name": "hardDurationSeconds",
          "type": "i64",
          "index": false
        },
        {
          "name": "softExpirationTimestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "hardExpirationTimestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "wagerType",
          "type": "u8",
          "index": false
        },
        {
          "name": "wager",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "PlayerJoined",
      "fields": [
        {
          "name": "gameId",
          "type": "u64",
          "index": false
        },
        {
          "name": "gameAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "wager",
          "type": "u64",
          "index": false
        },
        {
          "name": "creatorFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "PlayerLeft",
      "fields": [
        {
          "name": "gameId",
          "type": "u64",
          "index": false
        },
        {
          "name": "gameAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "GameSettled",
      "fields": [
        {
          "name": "gameId",
          "type": "u64",
          "index": false
        },
        {
          "name": "gameAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "players",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        },
        {
          "name": "winners",
          "type": {
            "vec": "publicKey"
          },
          "index": false
        },
        {
          "name": "payouts",
          "type": {
            "vec": "u64"
          },
          "index": false
        },
        {
          "name": "totalWager",
          "type": "u64",
          "index": false
        },
        {
          "name": "totalGambaFee",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "PlayerAlreadyInGame",
      "msg": "Player is already in the game"
    },
    {
      "code": 6001,
      "name": "PlayerNotInGame",
      "msg": "Player is not in the game"
    },
    {
      "code": 6002,
      "name": "GameInProgress",
      "msg": "Game is already in progress"
    },
    {
      "code": 6003,
      "name": "InvalidGameAccount",
      "msg": "Invalid game account"
    },
    {
      "code": 6004,
      "name": "CannotSettleYet",
      "msg": "Cannot settle yet"
    },
    {
      "code": 6005,
      "name": "AuthorityMismatch",
      "msg": "Authority mismatch"
    }
  ]
};
