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
          'name': 'maxCreatorFee',
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
      'name': 'playWithCustomCreatorFee',
      'docs': [
        'Copy of the play method, where the client can input a custom creator fee.\n    This is the newest version of the method and the old one only exists to maintain backwards compatibility.'
      ],
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
        },
        {
          'name': 'creatorFee',
          'type': 'u64'
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
          },
          {
            'name': 'maxCreatorFee',
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
      'name': 'TooFewBetOutcomes',
      'msg': 'The bet contains less than 2 outcomes'
    },
    {
      'code': 6002,
      'name': 'TooManyBetOutcomes',
      'msg': 'The bet contains too many outcomes'
    },
    {
      'code': 6003,
      'name': 'PlayerEdge',
      'msg': 'The bet gives the player an advantage'
    },
    {
      'code': 6004,
      'name': 'WithdrawWhilePlaying',
      'msg': 'Unable to withdraw while waiting for result. Close the account if needed'
    },
    {
      'code': 6005,
      'name': 'WagerTooSmall',
      'msg': 'Wager is too small'
    },
    {
      'code': 6006,
      'name': 'RNGSeedAlreadyProvided',
      'msg': 'The account already has an initial RNG seed'
    },
    {
      'code': 6007,
      'name': 'RNGPlayerResultNotNeeded',
      'msg': 'The player does not need a result or they already received one'
    },
    {
      'code': 6008,
      'name': 'RNGIncorrectSeed',
      'msg': 'RNG provided a seed that is incorrect'
    },
    {
      'code': 6009,
      'name': 'HouseAlreadyInitialized',
      'msg': 'House account has already been initialized'
    },
    {
      'code': 6010,
      'name': 'UserAlreadyInitialized',
      'msg': 'User account has already been initialized'
    },
    {
      'code': 6011,
      'name': 'PlayInactiveUser',
      'msg': 'Unable to play because the account isn\'t in a ready state'
    },
    {
      'code': 6012,
      'name': 'MaxPayoutExceeded',
      'msg': 'Potential payout for this bet is too high'
    },
    {
      'code': 6013,
      'name': 'CreatorFeeTooHigh',
      'msg': 'Creator fee is too high'
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
          name: 'maxCreatorFee',
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
      name: 'playWithCustomCreatorFee',
      docs: [
        'Copy of the play method, where the client can input a custom creator fee.\n    This is the newest version of the method and the old one only exists to maintain backwards compatibility.',
      ],
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
        {
          name: 'creatorFee',
          type: 'u64',
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
          {
            name: 'maxCreatorFee',
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
      name: 'TooFewBetOutcomes',
      msg: 'The bet contains less than 2 outcomes',
    },
    {
      code: 6002,
      name: 'TooManyBetOutcomes',
      msg: 'The bet contains too many outcomes',
    },
    {
      code: 6003,
      name: 'PlayerEdge',
      msg: 'The bet gives the player an advantage',
    },
    {
      code: 6004,
      name: 'WithdrawWhilePlaying',
      msg: 'Unable to withdraw while waiting for result. Close the account if needed',
    },
    {
      code: 6005,
      name: 'WagerTooSmall',
      msg: 'Wager is too small',
    },
    {
      code: 6006,
      name: 'RNGSeedAlreadyProvided',
      msg: 'The account already has an initial RNG seed',
    },
    {
      code: 6007,
      name: 'RNGPlayerResultNotNeeded',
      msg: 'The player does not need a result or they already received one',
    },
    {
      code: 6008,
      name: 'RNGIncorrectSeed',
      msg: 'RNG provided a seed that is incorrect',
    },
    {
      code: 6009,
      name: 'HouseAlreadyInitialized',
      msg: 'House account has already been initialized',
    },
    {
      code: 6010,
      name: 'UserAlreadyInitialized',
      msg: 'User account has already been initialized',
    },
    {
      code: 6011,
      name: 'PlayInactiveUser',
      msg: 'Unable to play because the account isn\'t in a ready state',
    },
    {
      code: 6012,
      name: 'MaxPayoutExceeded',
      msg: 'Potential payout for this bet is too high',
    },
    {
      code: 6013,
      name: 'CreatorFeeTooHigh',
      msg: 'Creator fee is too high',
    },
  ],
}
