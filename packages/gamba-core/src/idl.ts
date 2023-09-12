export type Gamba = {
  'version': '0.2.0',
  'name': 'gamba',
  'instructions': [
    {
      'name': 'houseInitialize',
      'accounts': [
        {
          'name': 'house',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'authority',
          'isMut': true,
          'isSigner': true
        },
        {
          'name': 'rng',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'systemProgram',
          'isMut': false,
          'isSigner': false
        }
      ],
      'args': [
        {
          'name': 'authority',
          'type': 'publicKey'
        },
        {
          'name': 'rng',
          'type': 'publicKey'
        }
      ]
    },
    {
      'name': 'houseSetAuthority',
      'accounts': [
        {
          'name': 'house',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'authority',
          'isMut': true,
          'isSigner': true
        },
        {
          'name': 'newAuthority',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'systemProgram',
          'isMut': false,
          'isSigner': false
        }
      ],
      'args': [
        {
          'name': 'newAuthority',
          'type': 'publicKey'
        }
      ]
    },
    {
      'name': 'houseSetRng',
      'accounts': [
        {
          'name': 'house',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'authority',
          'isMut': true,
          'isSigner': true
        },
        {
          'name': 'rng',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'systemProgram',
          'isMut': false,
          'isSigner': false
        }
      ],
      'args': [
        {
          'name': 'newRng',
          'type': 'publicKey'
        }
      ]
    },
    {
      'name': 'houseSetBonusMintAddress',
      'accounts': [
        {
          'name': 'house',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'authority',
          'isMut': true,
          'isSigner': true
        },
        {
          'name': 'mint',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'systemProgram',
          'isMut': false,
          'isSigner': false
        }
      ],
      'args': [
        {
          'name': 'newMint',
          'type': 'publicKey'
        }
      ]
    },
    {
      'name': 'houseSetConfig',
      'accounts': [
        {
          'name': 'house',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'authority',
          'isMut': true,
          'isSigner': true
        },
        {
          'name': 'systemProgram',
          'isMut': false,
          'isSigner': false
        }
      ],
      'args': [
        {
          'name': 'houseFee',
          'type': 'u64'
        },
        {
          'name': 'creatorFee',
          'type': 'u64'
        },
        {
          'name': 'maxPayout',
          'type': 'u64'
        }
      ]
    },
    {
      'name': 'houseWithdraw',
      'accounts': [
        {
          'name': 'house',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'authority',
          'isMut': true,
          'isSigner': true
        },
        {
          'name': 'systemProgram',
          'isMut': false,
          'isSigner': false
        }
      ],
      'args': [
        {
          'name': 'amount',
          'type': 'u64'
        }
      ]
    },
    {
      'name': 'approveBonusToken',
      'accounts': [
        {
          'name': 'to',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'tokenProgram',
          'isMut': false,
          'isSigner': false
        },
        {
          'name': 'delegate',
          'isMut': false,
          'isSigner': false
        },
        {
          'name': 'authority',
          'isMut': false,
          'isSigner': true
        }
      ],
      'args': [
        {
          'name': 'amount',
          'type': 'u64'
        }
      ]
    },
    {
      'name': 'redeemBonusToken',
      'accounts': [
        {
          'name': 'house',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'user',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'mint',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'tokenProgram',
          'isMut': false,
          'isSigner': false
        },
        {
          'name': 'from',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'authority',
          'isMut': false,
          'isSigner': true
        }
      ],
      'args': [
        {
          'name': 'amount',
          'type': 'u64'
        }
      ]
    },
    {
      'name': 'initializeUser',
      'accounts': [
        {
          'name': 'user',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'owner',
          'isMut': true,
          'isSigner': true
        },
        {
          'name': 'systemProgram',
          'isMut': false,
          'isSigner': false
        }
      ],
      'args': [
        {
          'name': 'owner',
          'type': 'publicKey'
        }
      ]
    },
    {
      'name': 'initialSeed',
      'accounts': [
        {
          'name': 'user',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'owner',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'house',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'rng',
          'isMut': true,
          'isSigner': true
        },
        {
          'name': 'systemProgram',
          'isMut': false,
          'isSigner': false
        }
      ],
      'args': [
        {
          'name': 'rngSeedHashed',
          'type': 'string'
        }
      ]
    },
    {
      'name': 'play',
      'accounts': [
        {
          'name': 'user',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'owner',
          'isMut': true,
          'isSigner': true
        },
        {
          'name': 'house',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'creator',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'systemProgram',
          'isMut': false,
          'isSigner': false
        }
      ],
      'args': [
        {
          'name': 'wager',
          'type': 'u64'
        },
        {
          'name': 'options',
          'type': {
            'vec': 'u32'
          }
        },
        {
          'name': 'clientSeed',
          'type': 'string'
        }
      ]
    },
    {
      'name': 'settleGame',
      'accounts': [
        {
          'name': 'user',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'owner',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'house',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'rng',
          'isMut': true,
          'isSigner': true
        },
        {
          'name': 'creator',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'systemProgram',
          'isMut': false,
          'isSigner': false
        }
      ],
      'args': [
        {
          'name': 'rngSeed',
          'type': 'string'
        },
        {
          'name': 'nextRngSeedHashed',
          'type': 'string'
        }
      ]
    },
    {
      'name': 'userWithdraw',
      'accounts': [
        {
          'name': 'user',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'owner',
          'isMut': true,
          'isSigner': true
        },
        {
          'name': 'systemProgram',
          'isMut': false,
          'isSigner': false
        }
      ],
      'args': [
        {
          'name': 'amount',
          'type': 'u64'
        }
      ]
    },
    {
      'name': 'close',
      'accounts': [
        {
          'name': 'user',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'owner',
          'isMut': true,
          'isSigner': true
        },
        {
          'name': 'house',
          'isMut': true,
          'isSigner': false
        },
        {
          'name': 'systemProgram',
          'isMut': false,
          'isSigner': false
        }
      ],
      'args': []
    }
  ],
  'accounts': [
    {
      'name': 'house',
      'type': {
        'kind': 'struct',
        'fields': [
          {
            'name': 'created',
            'type': 'bool'
          },
          {
            'name': 'authority',
            'type': 'publicKey'
          },
          {
            'name': 'rng',
            'type': 'publicKey'
          },
          {
            'name': 'bonusMint',
            'type': 'publicKey'
          },
          {
            'name': 'creatorFee',
            'type': 'u64'
          },
          {
            'name': 'houseFee',
            'type': 'u64'
          },
          {
            'name': 'maxPayout',
            'type': 'u64'
          }
        ]
      }
    },
    {
      'name': 'user',
      'type': {
        'kind': 'struct',
        'fields': [
          {
            'name': 'owner',
            'type': 'publicKey'
          },
          {
            'name': 'gamesPlayed',
            'type': 'u64'
          },
          {
            'name': 'balance',
            'type': 'u64'
          },
          {
            'name': 'bonusBalance',
            'type': 'u64'
          },
          {
            'name': 'created',
            'type': 'bool'
          },
          {
            'name': 'nonce',
            'type': 'i64'
          },
          {
            'name': 'status',
            'type': {
              'defined': 'Status'
            }
          },
          {
            'name': 'currentGame',
            'type': {
              'defined': 'Game'
            }
          },
          {
            'name': 'previousRngSeed',
            'type': 'string'
          }
        ]
      }
    }
  ],
  'types': [
    {
      'name': 'Game',
      'type': {
        'kind': 'struct',
        'fields': [
          {
            'name': 'creator',
            'type': 'publicKey'
          },
          {
            'name': 'options',
            'type': {
              'vec': 'u32'
            }
          },
          {
            'name': 'wager',
            'type': 'u64'
          },
          {
            'name': 'bonusUsed',
            'type': 'u64'
          },
          {
            'name': 'clientSeed',
            'type': 'string'
          },
          {
            'name': 'rngSeedHashed',
            'type': 'string'
          }
        ]
      }
    },
    {
      'name': 'Status',
      'type': {
        'kind': 'enum',
        'variants': [
          {
            'name': 'None'
          },
          {
            'name': 'HashedSeedRequested'
          },
          {
            'name': 'Playing'
          },
          {
            'name': 'SeedRequested'
          }
        ]
      }
    }
  ],
  'events': [
    {
      'name': 'BetSettledEvent',
      'fields': [
        {
          'name': 'creator',
          'type': 'publicKey',
          'index': false
        },
        {
          'name': 'player',
          'type': 'publicKey',
          'index': false
        },
        {
          'name': 'wager',
          'type': 'u64',
          'index': false
        },
        {
          'name': 'nonce',
          'type': 'i64',
          'index': false
        },
        {
          'name': 'rngSeed',
          'type': 'string',
          'index': false
        },
        {
          'name': 'clientSeed',
          'type': 'string',
          'index': false
        },
        {
          'name': 'resultMultiplier',
          'type': 'u64',
          'index': false
        },
        {
          'name': 'resultIndex',
          'type': 'u64',
          'index': false
        }
      ]
    },
    {
      'name': 'GameEvent',
      'fields': [
        {
          'name': 'creator',
          'type': 'publicKey',
          'index': false
        },
        {
          'name': 'player',
          'type': 'publicKey',
          'index': false
        },
        {
          'name': 'wager',
          'type': 'u64',
          'index': false
        },
        {
          'name': 'nonce',
          'type': 'i64',
          'index': false
        },
        {
          'name': 'rngSeed',
          'type': 'string',
          'index': false
        },
        {
          'name': 'clientSeed',
          'type': 'string',
          'index': false
        },
        {
          'name': 'resultMultiplier',
          'type': 'u64',
          'index': false
        },
        {
          'name': 'resultIndex',
          'type': 'u64',
          'index': false
        },
        {
          'name': 'options',
          'type': {
            'vec': 'u32'
          },
          'index': false
        }
      ]
    }
  ],
  'errors': [
    {
      'code': 6000,
      'name': 'Generic',
      'msg': 'Something went wrong'
    },
    {
      'code': 6001,
      'name': 'BadConfig',
      'msg': 'Bad game config'
    },
    {
      'code': 6002,
      'name': 'WagerTooSmall',
      'msg': 'WagerTooSmall'
    },
    {
      'code': 6003,
      'name': 'SeedAlreadyProvided',
      'msg': 'RNG tried to provide initial seed for an account that already has one'
    },
    {
      'code': 6004,
      'name': 'HouseAlreadyInitialized',
      'msg': 'House account has already been initialized'
    },
    {
      'code': 6005,
      'name': 'UserAlreadyInitialized',
      'msg': 'User account has already been initialized'
    },
    {
      'code': 6006,
      'name': 'IncorrectRngSeed',
      'msg': 'The provided RNG seed is incorrect'
    },
    {
      'code': 6007,
      'name': 'BonusNotAvailable',
      'msg': 'User bonus balance too low'
    },
    {
      'code': 6008,
      'name': 'PlayInactiveUser',
      'msg': 'User cannot be played because it isn\'t active'
    },
    {
      'code': 6009,
      'name': 'SettleInactiveUser',
      'msg': 'User cannot be settled because it isn\'t active'
    },
    {
      'code': 6010,
      'name': 'MaxPayoutExceeded',
      'msg': 'Potential payout exceeded limit'
    }
  ]
};

export const IDL: Gamba = {
  version: '0.2.0',
  name: 'gamba',
  instructions: [
    {
      name: 'houseInitialize',
      accounts: [
        {
          name: 'house',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'rng',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'authority',
          type: 'publicKey',
        },
        {
          name: 'rng',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'houseSetAuthority',
      accounts: [
        {
          name: 'house',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'newAuthority',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newAuthority',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'houseSetRng',
      accounts: [
        {
          name: 'house',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'rng',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newRng',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'houseSetBonusMintAddress',
      accounts: [
        {
          name: 'house',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'mint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newMint',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'houseSetConfig',
      accounts: [
        {
          name: 'house',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'houseFee',
          type: 'u64',
        },
        {
          name: 'creatorFee',
          type: 'u64',
        },
        {
          name: 'maxPayout',
          type: 'u64',
        },
      ],
    },
    {
      name: 'houseWithdraw',
      accounts: [
        {
          name: 'house',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'approveBonusToken',
      accounts: [
        {
          name: 'to',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'delegate',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'redeemBonusToken',
      accounts: [
        {
          name: 'house',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'from',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'initializeUser',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'owner',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'initialSeed',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'house',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rng',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'rngSeedHashed',
          type: 'string',
        },
      ],
    },
    {
      name: 'play',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'house',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'creator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'wager',
          type: 'u64',
        },
        {
          name: 'options',
          type: { vec: 'u32' },
        },
        {
          name: 'clientSeed',
          type: 'string',
        },
      ],
    },
    {
      name: 'settleGame',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'house',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rng',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'creator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'rngSeed',
          type: 'string',
        },
        {
          name: 'nextRngSeedHashed',
          type: 'string',
        },
      ],
    },
    {
      name: 'userWithdraw',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'close',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'house',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'house',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'created',
            type: 'bool',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'rng',
            type: 'publicKey',
          },
          {
            name: 'bonusMint',
            type: 'publicKey',
          },
          {
            name: 'creatorFee',
            type: 'u64',
          },
          {
            name: 'houseFee',
            type: 'u64',
          },
          {
            name: 'maxPayout',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'user',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'gamesPlayed',
            type: 'u64',
          },
          {
            name: 'balance',
            type: 'u64',
          },
          {
            name: 'bonusBalance',
            type: 'u64',
          },
          {
            name: 'created',
            type: 'bool',
          },
          {
            name: 'nonce',
            type: 'i64',
          },
          {
            name: 'status',
            type: { defined: 'Status' },
          },
          {
            name: 'currentGame',
            type: { defined: 'Game' },
          },
          {
            name: 'previousRngSeed',
            type: 'string',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'Game',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'creator',
            type: 'publicKey',
          },
          {
            name: 'options',
            type: { vec: 'u32' },
          },
          {
            name: 'wager',
            type: 'u64',
          },
          {
            name: 'bonusUsed',
            type: 'u64',
          },
          {
            name: 'clientSeed',
            type: 'string',
          },
          {
            name: 'rngSeedHashed',
            type: 'string',
          },
        ],
      },
    },
    {
      name: 'Status',
      type: {
        kind: 'enum',
        variants: [
          { name: 'None' },
          { name: 'HashedSeedRequested' },
          { name: 'Playing' },
          { name: 'SeedRequested' },
        ],
      },
    },
  ],
  events: [
    {
      name: 'BetSettledEvent',
      fields: [
        {
          name: 'creator',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'player',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'wager',
          type: 'u64',
          index: false,
        },
        {
          name: 'nonce',
          type: 'i64',
          index: false,
        },
        {
          name: 'rngSeed',
          type: 'string',
          index: false,
        },
        {
          name: 'clientSeed',
          type: 'string',
          index: false,
        },
        {
          name: 'resultMultiplier',
          type: 'u64',
          index: false,
        },
        {
          name: 'resultIndex',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'GameEvent',
      fields: [
        {
          name: 'creator',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'player',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'wager',
          type: 'u64',
          index: false,
        },
        {
          name: 'nonce',
          type: 'i64',
          index: false,
        },
        {
          name: 'rngSeed',
          type: 'string',
          index: false,
        },
        {
          name: 'clientSeed',
          type: 'string',
          index: false,
        },
        {
          name: 'resultMultiplier',
          type: 'u64',
          index: false,
        },
        {
          name: 'resultIndex',
          type: 'u64',
          index: false,
        },
        {
          name: 'options',
          type: { vec: 'u32' },
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'Generic',
      msg: 'Something went wrong',
    },
    {
      code: 6001,
      name: 'BadConfig',
      msg: 'Bad game config',
    },
    {
      code: 6002,
      name: 'WagerTooSmall',
      msg: 'WagerTooSmall',
    },
    {
      code: 6003,
      name: 'SeedAlreadyProvided',
      msg: 'RNG tried to provide initial seed for an account that already has one',
    },
    {
      code: 6004,
      name: 'HouseAlreadyInitialized',
      msg: 'House account has already been initialized',
    },
    {
      code: 6005,
      name: 'UserAlreadyInitialized',
      msg: 'User account has already been initialized',
    },
    {
      code: 6006,
      name: 'IncorrectRngSeed',
      msg: 'The provided RNG seed is incorrect',
    },
    {
      code: 6007,
      name: 'BonusNotAvailable',
      msg: 'User bonus balance too low',
    },
    {
      code: 6008,
      name: 'PlayInactiveUser',
      msg: 'User cannot be played because it isn\'t active',
    },
    {
      code: 6009,
      name: 'SettleInactiveUser',
      msg: 'User cannot be settled because it isn\'t active',
    },
    {
      code: 6010,
      name: 'MaxPayoutExceeded',
      msg: 'Potential payout exceeded limit',
    },
  ],
}
