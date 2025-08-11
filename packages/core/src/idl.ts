export type Gamba = {
  'address': 'Gamba2hK6KV3quKq854B3sQG1WMdq3zgQLPKqyK4qS18',
  'metadata': {
    'name': 'gamba',
    'version': '0.1.0',
    'spec': '0.1.0'
  },
  'instructions': [
    {
      'name': 'gambaInitialize',
      'discriminator': [
        255,
        140,
        190,
        102,
        152,
        30,
        179,
        112
      ],
      'accounts': [
        {
          'name': 'initializer',
          'writable': true,
          'signer': true
        },
        {
          'name': 'gambaState',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          }
        },
        {
          'name': 'systemProgram'
        }
      ],
      'args': []
    },
    {
      'name': 'gambaSetAuthority',
      'discriminator': [
        60,
        11,
        159,
        59,
        150,
        12,
        106,
        78
      ],
      'accounts': [
        {
          'name': 'authority',
          'writable': true,
          'signer': true
        },
        {
          'name': 'gambaState',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          },
          'relations': [
            'authority'
          ]
        }
      ],
      'args': [
        {
          'name': 'authority',
          'type': 'pubkey'
        }
      ]
    },
    {
      'name': 'gambaSetConfig',
      'discriminator': [
        205,
        11,
        209,
        24,
        204,
        47,
        25,
        186
      ],
      'accounts': [
        {
          'name': 'authority',
          'writable': true,
          'signer': true
        },
        {
          'name': 'gambaState',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          },
          'relations': [
            'authority'
          ]
        }
      ],
      'args': [
        {
          'name': 'rngAddress',
          'type': 'pubkey'
        },
        {
          'name': 'gambaFee',
          'type': 'u64'
        },
        {
          'name': 'maxCreatorFee',
          'type': 'u64'
        },
        {
          'name': 'poolCreationFee',
          'type': 'u64'
        },
        {
          'name': 'antiSpamFee',
          'type': 'u64'
        },
        {
          'name': 'maxHouseEdge',
          'type': 'u64'
        },
        {
          'name': 'defaultPoolFee',
          'type': 'u64'
        },
        {
          'name': 'jackpotPayoutToUserBps',
          'type': 'u64'
        },
        {
          'name': 'jackpotPayoutToCreatorBps',
          'type': 'u64'
        },
        {
          'name': 'jackpotPayoutToPoolBps',
          'type': 'u64'
        },
        {
          'name': 'jackpotPayoutToGambaBps',
          'type': 'u64'
        },
        {
          'name': 'bonusToJackpotRatioBps',
          'type': 'u64'
        },
        {
          'name': 'maxPayoutBps',
          'type': 'u64'
        },
        {
          'name': 'poolWithdrawFeeBps',
          'type': 'u64'
        },
        {
          'name': 'poolCreationAllowed',
          'type': 'bool'
        },
        {
          'name': 'poolDepositAllowed',
          'type': 'bool'
        },
        {
          'name': 'poolWithdrawAllowed',
          'type': 'bool'
        },
        {
          'name': 'playingAllowed',
          'type': 'bool'
        },
        {
          'name': 'distributionRecipient',
          'type': 'pubkey'
        }
      ]
    },
    {
      'name': 'poolInitialize',
      'discriminator': [
        37,
        10,
        195,
        69,
        4,
        213,
        88,
        173
      ],
      'accounts': [
        {
          'name': 'initializer',
          'writable': true,
          'signer': true
        },
        {
          'name': 'gambaState',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          }
        },
        {
          'name': 'underlyingTokenMint'
        },
        {
          'name': 'pool',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'underlying_token_mint',
                'account': 'Mint'
              },
              {
                'kind': 'arg',
                'path': 'pool_authority'
              }
            ]
          }
        },
        {
          'name': 'poolUnderlyingTokenAccount',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  65,
                  84,
                  65,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'poolBonusUnderlyingTokenAccount',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  85,
                  78,
                  68,
                  69,
                  82,
                  76,
                  89,
                  73,
                  78,
                  71,
                  95,
                  84,
                  65,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'poolJackpotTokenAccount',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  74,
                  65,
                  67,
                  75,
                  80,
                  79,
                  84,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'gambaStateAta',
          'writable': true
        },
        {
          'name': 'lpMint',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  76,
                  80,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'lpMintMetadata',
          'writable': true
        },
        {
          'name': 'bonusMint',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'bonusMintMetadata',
          'writable': true
        },
        {
          'name': 'associatedTokenProgram'
        },
        {
          'name': 'tokenProgram'
        },
        {
          'name': 'systemProgram'
        },
        {
          'name': 'rent'
        },
        {
          'name': 'tokenMetadataProgram'
        }
      ],
      'args': [
        {
          'name': 'poolAuthority',
          'type': 'pubkey'
        },
        {
          'name': 'lookupAddress',
          'type': 'pubkey'
        }
      ]
    },
    {
      'name': 'poolDeposit',
      'discriminator': [
        26,
        109,
        164,
        79,
        207,
        145,
        204,
        217
      ],
      'accounts': [
        {
          'name': 'user',
          'writable': true,
          'signer': true
        },
        {
          'name': 'gambaState',
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          }
        },
        {
          'name': 'pool',
          'writable': true
        },
        {
          'name': 'poolUnderlyingTokenAccount',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  65,
                  84,
                  65,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'lpMint',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  76,
                  80,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'underlyingTokenMint'
        },
        {
          'name': 'userUnderlyingAta',
          'writable': true
        },
        {
          'name': 'userLpAta',
          'writable': true
        },
        {
          'name': 'associatedTokenProgram'
        },
        {
          'name': 'tokenProgram'
        },
        {
          'name': 'systemProgram'
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
      'name': 'poolWithdraw',
      'discriminator': [
        50,
        1,
        23,
        25,
        135,
        221,
        159,
        182
      ],
      'accounts': [
        {
          'name': 'user',
          'writable': true,
          'signer': true
        },
        {
          'name': 'pool',
          'writable': true
        },
        {
          'name': 'poolUnderlyingTokenAccount',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  65,
                  84,
                  65,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'lpMint',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  76,
                  80,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'underlyingTokenMint'
        },
        {
          'name': 'userUnderlyingAta',
          'writable': true
        },
        {
          'name': 'userLpAta',
          'writable': true
        },
        {
          'name': 'gambaState',
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          }
        },
        {
          'name': 'associatedTokenProgram'
        },
        {
          'name': 'tokenProgram'
        },
        {
          'name': 'systemProgram'
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
      'name': 'poolMintBonusTokens',
      'discriminator': [
        105,
        130,
        72,
        25,
        88,
        185,
        100,
        55
      ],
      'accounts': [
        {
          'name': 'user',
          'writable': true,
          'signer': true
        },
        {
          'name': 'pool'
        },
        {
          'name': 'gambaState',
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          }
        },
        {
          'name': 'underlyingTokenMint'
        },
        {
          'name': 'poolBonusUnderlyingTokenAccount',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  85,
                  78,
                  68,
                  69,
                  82,
                  76,
                  89,
                  73,
                  78,
                  71,
                  95,
                  84,
                  65,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'bonusMint',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'poolJackpotTokenAccount',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  74,
                  65,
                  67,
                  75,
                  80,
                  79,
                  84,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'userUnderlyingAta',
          'writable': true
        },
        {
          'name': 'userBonusAta',
          'writable': true
        },
        {
          'name': 'associatedTokenProgram'
        },
        {
          'name': 'tokenProgram'
        },
        {
          'name': 'systemProgram'
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
      'name': 'poolAuthorityConfig',
      'discriminator': [
        58,
        12,
        184,
        118,
        14,
        99,
        110,
        17
      ],
      'accounts': [
        {
          'name': 'user',
          'writable': true,
          'signer': true
        },
        {
          'name': 'gambaState',
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          }
        },
        {
          'name': 'pool',
          'writable': true
        }
      ],
      'args': [
        {
          'name': 'minWager',
          'type': 'u64'
        },
        {
          'name': 'depositLimit',
          'type': 'bool'
        },
        {
          'name': 'depositLimitAmount',
          'type': 'u64'
        },
        {
          'name': 'customPoolFee',
          'type': 'bool'
        },
        {
          'name': 'customPoolFeeBps',
          'type': 'u64'
        },
        {
          'name': 'customMexPayout',
          'type': 'bool'
        },
        {
          'name': 'customMaxPayoutBps',
          'type': 'u64'
        },
        {
          'name': 'depositWhitelistRequired',
          'type': 'bool'
        },
        {
          'name': 'depositWhitelistAddress',
          'type': 'pubkey'
        }
      ]
    },
    {
      'name': 'poolGambaConfig',
      'discriminator': [
        197,
        177,
        234,
        111,
        246,
        248,
        20,
        155
      ],
      'accounts': [
        {
          'name': 'user',
          'writable': true,
          'signer': true
        },
        {
          'name': 'gambaState',
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          }
        },
        {
          'name': 'pool',
          'writable': true
        }
      ],
      'args': [
        {
          'name': 'antiSpamFeeExemption',
          'type': 'bool'
        },
        {
          'name': 'customGambaFee',
          'type': 'bool'
        },
        {
          'name': 'customGambaFeeBps',
          'type': 'u64'
        }
      ]
    },
    {
      'name': 'playerInitialize',
      'discriminator': [
        213,
        160,
        145,
        88,
        197,
        68,
        63,
        150
      ],
      'accounts': [
        {
          'name': 'player',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  76,
                  65,
                  89,
                  69,
                  82,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'user'
              }
            ]
          }
        },
        {
          'name': 'game',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  71,
                  65,
                  77,
                  69,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'user'
              }
            ]
          }
        },
        {
          'name': 'user',
          'writable': true,
          'signer': true
        },
        {
          'name': 'systemProgram'
        }
      ],
      'args': []
    },
    {
      'name': 'playGame',
      'discriminator': [
        37,
        88,
        207,
        85,
        42,
        144,
        122,
        197
      ],
      'accounts': [
        {
          'name': 'user',
          'writable': true,
          'signer': true
        },
        {
          'name': 'player',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  76,
                  65,
                  89,
                  69,
                  82,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'user'
              }
            ]
          }
        },
        {
          'name': 'game',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  71,
                  65,
                  77,
                  69,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'user'
              }
            ]
          }
        },
        {
          'name': 'pool',
          'writable': true
        },
        {
          'name': 'underlyingTokenMint'
        },
        {
          'name': 'bonusTokenMint',
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'userUnderlyingAta',
          'writable': true
        },
        {
          'name': 'creator'
        },
        {
          'name': 'creatorAta',
          'writable': true
        },
        {
          'name': 'playerAta',
          'writable': true
        },
        {
          'name': 'playerBonusAta',
          'writable': true,
          'optional': true
        },
        {
          'name': 'userBonusAta',
          'writable': true,
          'optional': true
        },
        {
          'name': 'gambaState',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          }
        },
        {
          'name': 'poolJackpotTokenAccount',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  74,
                  65,
                  67,
                  75,
                  80,
                  79,
                  84,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'systemProgram'
        },
        {
          'name': 'tokenProgram'
        },
        {
          'name': 'associatedTokenProgram'
        }
      ],
      'args': [
        {
          'name': 'wager',
          'type': 'u64'
        },
        {
          'name': 'bet',
          'type': {
            'vec': 'u32'
          }
        },
        {
          'name': 'clientSeed',
          'type': 'string'
        },
        {
          'name': 'creatorFeeBps',
          'type': 'u32'
        },
        {
          'name': 'jackpotFeeBps',
          'type': 'u32'
        },
        {
          'name': 'metadata',
          'type': 'string'
        }
      ]
    },
    {
      'name': 'playerClose',
      'discriminator': [
        26,
        155,
        61,
        179,
        53,
        157,
        80,
        30
      ],
      'accounts': [
        {
          'name': 'user',
          'writable': true,
          'signer': true
        },
        {
          'name': 'player',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  76,
                  65,
                  89,
                  69,
                  82,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'user'
              }
            ]
          }
        },
        {
          'name': 'game',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  71,
                  65,
                  77,
                  69,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'user'
              }
            ]
          }
        }
      ],
      'args': []
    },
    {
      'name': 'playerClaim',
      'discriminator': [
        188,
        220,
        237,
        31,
        181,
        18,
        85,
        45
      ],
      'accounts': [
        {
          'name': 'user',
          'writable': true,
          'signer': true
        },
        {
          'name': 'underlyingTokenMint'
        },
        {
          'name': 'player',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  76,
                  65,
                  89,
                  69,
                  82,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'user'
              }
            ]
          }
        },
        {
          'name': 'game',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  71,
                  65,
                  77,
                  69,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'user'
              }
            ]
          }
        },
        {
          'name': 'playerAta',
          'writable': true
        },
        {
          'name': 'userUnderlyingAta',
          'writable': true
        },
        {
          'name': 'systemProgram'
        },
        {
          'name': 'tokenProgram'
        },
        {
          'name': 'associatedTokenProgram'
        }
      ],
      'args': []
    },
    {
      'name': 'rngSettle',
      'discriminator': [
        23,
        35,
        236,
        185,
        14,
        171,
        26,
        222
      ],
      'accounts': [
        {
          'name': 'rng',
          'writable': true,
          'signer': true
        },
        {
          'name': 'user',
          'writable': true
        },
        {
          'name': 'player',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  76,
                  65,
                  89,
                  69,
                  82,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'user'
              }
            ]
          }
        },
        {
          'name': 'game',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  71,
                  65,
                  77,
                  69,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'user'
              }
            ]
          }
        },
        {
          'name': 'pool',
          'writable': true
        },
        {
          'name': 'underlyingTokenMint'
        },
        {
          'name': 'poolUnderlyingTokenAccount',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  65,
                  84,
                  65,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'poolBonusUnderlyingTokenAccount',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  85,
                  78,
                  68,
                  69,
                  82,
                  76,
                  89,
                  73,
                  78,
                  71,
                  95,
                  84,
                  65,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'playerAta',
          'writable': true
        },
        {
          'name': 'userUnderlyingAta',
          'writable': true
        },
        {
          'name': 'gambaState',
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          }
        },
        {
          'name': 'gambaStateAta',
          'writable': true
        },
        {
          'name': 'creator'
        },
        {
          'name': 'creatorAta',
          'writable': true
        },
        {
          'name': 'bonusTokenMint',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'playerBonusAta',
          'writable': true,
          'optional': true
        },
        {
          'name': 'poolJackpotTokenAccount',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  74,
                  65,
                  67,
                  75,
                  80,
                  79,
                  84,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'pool',
                'account': 'Pool'
              }
            ]
          }
        },
        {
          'name': 'escrowTokenAccount',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
                  69,
                  83,
                  67,
                  82,
                  79,
                  87,
                  34
                ]
              },
              {
                'kind': 'account',
                'path': 'player',
                'account': 'Player'
              }
            ]
          }
        },
        {
          'name': 'systemProgram'
        },
        {
          'name': 'tokenProgram'
        },
        {
          'name': 'associatedTokenProgram'
        },
        {
          'name': 'rent'
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
      'name': 'rngProvideHashedSeed',
      'discriminator': [
        238,
        154,
        25,
        143,
        191,
        19,
        25,
        224
      ],
      'accounts': [
        {
          'name': 'game',
          'writable': true
        },
        {
          'name': 'rng',
          'writable': true,
          'signer': true
        },
        {
          'name': 'gambaState',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          }
        }
      ],
      'args': [
        {
          'name': 'nextRngSeedHashed',
          'type': 'string'
        }
      ]
    },
    {
      'name': 'distributeFees',
      'discriminator': [
        120,
        56,
        27,
        7,
        53,
        176,
        113,
        186
      ],
      'accounts': [
        {
          'name': 'signer',
          'writable': true,
          'signer': true
        },
        {
          'name': 'underlyingTokenMint'
        },
        {
          'name': 'gambaState',
          'writable': true,
          'pda': {
            'seeds': [
              {
                'kind': 'const',
                'value': [
                  34,
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
                  69,
                  34
                ]
              }
            ]
          }
        },
        {
          'name': 'gambaStateAta',
          'writable': true
        },
        {
          'name': 'distributionRecipient',
          'writable': true
        },
        {
          'name': 'distributionRecipientAta',
          'writable': true
        },
        {
          'name': 'associatedTokenProgram'
        },
        {
          'name': 'tokenProgram'
        },
        {
          'name': 'systemProgram'
        }
      ],
      'args': [
        {
          'name': 'nativeSol',
          'type': 'bool'
        }
      ]
    }
  ],
  'accounts': [
    {
      'name': 'Game',
      'discriminator': [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18
      ]
    },
    {
      'name': 'Player',
      'discriminator': [
        205,
        222,
        112,
        7,
        165,
        155,
        206,
        218
      ]
    },
    {
      'name': 'Pool',
      'discriminator': [
        241,
        154,
        109,
        4,
        17,
        177,
        109,
        188
      ]
    },
    {
      'name': 'GambaState',
      'discriminator': [
        142,
        203,
        14,
        224,
        153,
        118,
        52,
        200
      ]
    }
  ],
  'events': [
    {
      'name': 'GameSettled',
      'discriminator': [
        63,
        109,
        128,
        85,
        229,
        63,
        167,
        176
      ]
    },
    {
      'name': 'PoolChange',
      'discriminator': [
        241,
        7,
        155,
        154,
        56,
        57,
        0,
        101
      ]
    },
    {
      'name': 'PoolCreated',
      'discriminator': [
        202,
        44,
        41,
        88,
        104,
        220,
        157,
        82
      ]
    }
  ],
  'errors': [
    {
      'code': 6000,
      'name': 'GenericError',
      'msg': 'Something went wrong'
    },
    {
      'code': 6001,
      'name': 'Unauthorized',
      'msg': 'Unauthorized'
    },
    {
      'code': 6002,
      'name': 'CustomPoolFeeExceedsLimit',
      'msg': 'Custom pool fee cannot exceed 100%'
    },
    {
      'code': 6003,
      'name': 'CustomMaxPayoutExceedsLimit',
      'msg': 'Custom max payout cannot exceed 50%'
    }
  ],
  'types': [
    {
      'name': 'PlayerError',
      'type': {
        'kind': 'enum',
        'variants': [
          {
            'name': 'NotReadyToPlay'
          },
          {
            'name': 'CreatorFeeTooHigh'
          },
          {
            'name': 'WagerTooSmall'
          },
          {
            'name': 'TooFewBetOutcomes'
          },
          {
            'name': 'TooManyBetOutcomes'
          },
          {
            'name': 'PlayerAdvantage'
          },
          {
            'name': 'HouseAdvantageTooHigh'
          },
          {
            'name': 'MaxPayoutExceeded'
          }
        ]
      }
    },
    {
      'name': 'RngError',
      'type': {
        'kind': 'enum',
        'variants': [
          {
            'name': 'Generic'
          },
          {
            'name': 'InitialHashedSeedAlreadyProvided'
          },
          {
            'name': 'IncorrectRngSeed'
          },
          {
            'name': 'ResultNotRequested'
          }
        ]
      }
    },
    {
      'name': 'GambaStateError',
      'type': {
        'kind': 'enum',
        'variants': [
          {
            'name': 'PlaysNotAllowed'
          },
          {
            'name': 'DepositNotAllowed'
          },
          {
            'name': 'WithdrawalNotAllowed'
          },
          {
            'name': 'PoolCreationNotAllowed'
          },
          {
            'name': 'DepositLimitExceeded'
          },
          {
            'name': 'DepositWhitelistRequired'
          }
        ]
      }
    },
    {
      'name': 'PoolAction',
      'type': {
        'kind': 'enum',
        'variants': [
          {
            'name': 'Deposit'
          },
          {
            'name': 'Withdraw'
          }
        ]
      }
    },
    {
      'name': 'GameStatus',
      'type': {
        'kind': 'enum',
        'variants': [
          {
            'name': 'None'
          },
          {
            'name': 'NotInitialized'
          },
          {
            'name': 'Ready'
          },
          {
            'name': 'ResultRequested'
          }
        ]
      }
    },
    {
      'name': 'Game',
      'type': {
        'kind': 'struct',
        'fields': [
          {
            'name': 'bump',
            'type': {
              'array': [
                'u8',
                1
              ]
            }
          },
          {
            'name': 'nonce',
            'type': 'u64'
          },
          {
            'name': 'user',
            'type': 'pubkey'
          },
          {
            'name': 'tokenMint',
            'type': 'pubkey'
          },
          {
            'name': 'pool',
            'type': 'pubkey'
          },
          {
            'name': 'status',
            'type': {
              'defined': {
                'name': 'GameStatus'
              }
            }
          },
          {
            'name': 'nextRngSeedHashed',
            'docs': [
              'SHA256 of coming rng_seed. Available at start of the game'
            ],
            'type': 'string'
          },
          {
            'name': 'rngSeed',
            'docs': [
              'Is revealed by the RNG after a play'
            ],
            'type': 'string'
          },
          {
            'name': 'timestamp',
            'type': 'i64'
          },
          {
            'name': 'creator',
            'type': 'pubkey'
          },
          {
            'name': 'creatorMeta',
            'type': 'string'
          },
          {
            'name': 'wager',
            'type': 'u64'
          },
          {
            'name': 'underlyingUsed',
            'type': 'u64'
          },
          {
            'name': 'bonusUsed',
            'type': 'u64'
          },
          {
            'name': 'creatorFee',
            'type': 'u64'
          },
          {
            'name': 'gambaFee',
            'type': 'u64'
          },
          {
            'name': 'poolFee',
            'type': 'u64'
          },
          {
            'name': 'jackpotFee',
            'type': 'u64'
          },
          {
            'name': 'jackpotResult',
            'type': 'u64'
          },
          {
            'name': 'jackpotProbabilityUbps',
            'type': 'u64'
          },
          {
            'name': 'jackpotPayout',
            'type': 'u64'
          },
          {
            'name': 'clientSeed',
            'type': 'string'
          },
          {
            'name': 'bet',
            'type': {
              'vec': 'u32'
            }
          },
          {
            'name': 'result',
            'type': 'u64'
          },
          {
            'name': 'points',
            'type': 'bool'
          },
          {
            'name': 'pointsAuthority',
            'type': 'pubkey'
          },
          {
            'name': 'metadata',
            'type': 'string'
          }
        ]
      }
    },
    {
      'name': 'Player',
      'type': {
        'kind': 'struct',
        'fields': [
          {
            'name': 'bump',
            'type': {
              'array': [
                'u8',
                1
              ]
            }
          },
          {
            'name': 'user',
            'type': 'pubkey'
          },
          {
            'name': 'nonce',
            'type': 'u64'
          }
        ]
      }
    },
    {
      'name': 'Pool',
      'type': {
        'kind': 'struct',
        'fields': [
          {
            'name': 'bump',
            'type': {
              'array': [
                'u8',
                1
              ]
            }
          },
          {
            'name': 'lookupAddress',
            'type': 'pubkey'
          },
          {
            'name': 'poolAuthority',
            'type': 'pubkey'
          },
          {
            'name': 'underlyingTokenMint',
            'type': 'pubkey'
          },
          {
            'name': 'antiSpamFeeExempt',
            'type': 'bool'
          },
          {
            'name': 'minWager',
            'type': 'u64'
          },
          {
            'name': 'plays',
            'type': 'u64'
          },
          {
            'name': 'liquidityCheckpoint',
            'type': 'u64'
          },
          {
            'name': 'depositLimit',
            'type': 'bool'
          },
          {
            'name': 'depositLimitAmount',
            'type': 'u64'
          },
          {
            'name': 'customPoolFee',
            'type': 'bool'
          },
          {
            'name': 'customPoolFeeBps',
            'type': 'u64'
          },
          {
            'name': 'customGambaFee',
            'type': 'bool'
          },
          {
            'name': 'customGambaFeeBps',
            'type': 'u64'
          },
          {
            'name': 'customMaxPayout',
            'type': 'bool'
          },
          {
            'name': 'customMaxPayoutBps',
            'type': 'u64'
          },
          {
            'name': 'customBonusTokenMint',
            'type': 'pubkey'
          },
          {
            'name': 'customBonusToken',
            'type': 'bool'
          },
          {
            'name': 'customMaxCreatorFee',
            'type': 'bool'
          },
          {
            'name': 'customMaxCreatorFeeBps',
            'type': 'u64'
          },
          {
            'name': 'depositWhitelistRequired',
            'type': 'bool'
          },
          {
            'name': 'depositWhitelistAddress',
            'type': 'pubkey'
          }
        ]
      }
    },
    {
      'name': 'GambaState',
      'type': {
        'kind': 'struct',
        'fields': [
          {
            'name': 'authority',
            'type': 'pubkey'
          },
          {
            'name': 'rngAddress',
            'type': 'pubkey'
          },
          {
            'name': 'rngAddress2',
            'type': 'pubkey'
          },
          {
            'name': 'antiSpamFee',
            'type': 'u64'
          },
          {
            'name': 'gambaFeeBps',
            'type': 'u64'
          },
          {
            'name': 'poolCreationFee',
            'type': 'u64'
          },
          {
            'name': 'defaultPoolFee',
            'type': 'u64'
          },
          {
            'name': 'jackpotPayoutToUserBps',
            'type': 'u64'
          },
          {
            'name': 'jackpotPayoutToCreatorBps',
            'type': 'u64'
          },
          {
            'name': 'jackpotPayoutToPoolBps',
            'type': 'u64'
          },
          {
            'name': 'jackpotPayoutToGambaBps',
            'type': 'u64'
          },
          {
            'name': 'bonusToJackpotRatioBps',
            'type': 'u64'
          },
          {
            'name': 'maxHouseEdgeBps',
            'type': 'u64'
          },
          {
            'name': 'maxCreatorFeeBps',
            'type': 'u64'
          },
          {
            'name': 'maxPayoutBps',
            'type': 'u64'
          },
          {
            'name': 'poolWithdrawFeeBps',
            'type': 'u64'
          },
          {
            'name': 'poolCreationAllowed',
            'type': 'bool'
          },
          {
            'name': 'poolDepositAllowed',
            'type': 'bool'
          },
          {
            'name': 'poolWithdrawAllowed',
            'type': 'bool'
          },
          {
            'name': 'playingAllowed',
            'type': 'bool'
          },
          {
            'name': 'distributionRecipient',
            'type': 'pubkey'
          },
          {
            'name': 'bump',
            'type': {
              'array': [
                'u8',
                1
              ]
            }
          }
        ]
      }
    },
    {
      'name': 'GameSettled',
      'type': {
        'kind': 'struct',
        'fields': [
          {
            'name': 'user',
            'type': 'pubkey'
          },
          {
            'name': 'pool',
            'type': 'pubkey'
          },
          {
            'name': 'tokenMint',
            'type': 'pubkey'
          },
          {
            'name': 'creator',
            'type': 'pubkey'
          },
          {
            'name': 'creatorFee',
            'type': 'u64'
          },
          {
            'name': 'gambaFee',
            'type': 'u64'
          },
          {
            'name': 'poolFee',
            'type': 'u64'
          },
          {
            'name': 'jackpotFee',
            'type': 'u64'
          },
          {
            'name': 'underlyingUsed',
            'type': 'u64'
          },
          {
            'name': 'bonusUsed',
            'type': 'u64'
          },
          {
            'name': 'wager',
            'type': 'u64'
          },
          {
            'name': 'payout',
            'type': 'u64'
          },
          {
            'name': 'multiplierBps',
            'type': 'u32'
          },
          {
            'name': 'payoutFromBonusPool',
            'type': 'u64'
          },
          {
            'name': 'payoutFromNormalPool',
            'type': 'u64'
          },
          {
            'name': 'jackpotProbabilityUbps',
            'type': 'u64'
          },
          {
            'name': 'jackpotResult',
            'type': 'u64'
          },
          {
            'name': 'nonce',
            'type': 'u64'
          },
          {
            'name': 'clientSeed',
            'type': 'string'
          },
          {
            'name': 'resultIndex',
            'type': 'u64'
          },
          {
            'name': 'bet',
            'type': {
              'vec': 'u32'
            }
          },
          {
            'name': 'jackpotPayoutToUser',
            'type': 'u64'
          },
          {
            'name': 'poolLiquidity',
            'type': 'u64'
          },
          {
            'name': 'rngSeed',
            'type': 'string'
          },
          {
            'name': 'nextRngSeedHashed',
            'type': 'string'
          },
          {
            'name': 'metadata',
            'type': 'string'
          }
        ]
      }
    },
    {
      'name': 'PoolChange',
      'type': {
        'kind': 'struct',
        'fields': [
          {
            'name': 'user',
            'type': 'pubkey'
          },
          {
            'name': 'pool',
            'type': 'pubkey'
          },
          {
            'name': 'tokenMint',
            'type': 'pubkey'
          },
          {
            'name': 'action',
            'type': {
              'defined': {
                'name': 'PoolAction'
              }
            }
          },
          {
            'name': 'amount',
            'type': 'u64'
          },
          {
            'name': 'postLiquidity',
            'type': 'u64'
          },
          {
            'name': 'lpSupply',
            'type': 'u64'
          }
        ]
      }
    },
    {
      'name': 'PoolCreated',
      'type': {
        'kind': 'struct',
        'fields': [
          {
            'name': 'user',
            'type': 'pubkey'
          },
          {
            'name': 'authority',
            'type': 'pubkey'
          },
          {
            'name': 'pool',
            'type': 'pubkey'
          },
          {
            'name': 'tokenMint',
            'type': 'pubkey'
          }
        ]
      }
    }
  ]
}

export const IDL: Gamba = {
  address: 'Gamba2hK6KV3quKq854B3sQG1WMdq3zgQLPKqyK4qS18',
  metadata: {
    name: 'gamba',
    version: '0.1.0',
    spec: '0.1.0',
  },
  instructions: [
    {
      name: 'gambaInitialize',
      discriminator: [
        255,
        140,
        190,
        102,
        152,
        30,
        179,
        112,
      ],
      accounts: [
        {
          name: 'initializer',
          writable: true,
          signer: true,
        },
        {
          name: 'gambaState',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
        },
        { name: 'systemProgram' },
      ],
      args: [],
    },
    {
      name: 'gambaSetAuthority',
      discriminator: [
        60,
        11,
        159,
        59,
        150,
        12,
        106,
        78,
      ],
      accounts: [
        {
          name: 'authority',
          writable: true,
          signer: true,
        },
        {
          name: 'gambaState',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
          relations: [
            'authority',
          ],
        },
      ],
      args: [
        {
          name: 'authority',
          type: 'pubkey',
        },
      ],
    },
    {
      name: 'gambaSetConfig',
      discriminator: [
        205,
        11,
        209,
        24,
        204,
        47,
        25,
        186,
      ],
      accounts: [
        {
          name: 'authority',
          writable: true,
          signer: true,
        },
        {
          name: 'gambaState',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
          relations: [
            'authority',
          ],
        },
      ],
      args: [
        {
          name: 'rngAddress',
          type: 'pubkey',
        },
        {
          name: 'gambaFee',
          type: 'u64',
        },
        {
          name: 'maxCreatorFee',
          type: 'u64',
        },
        {
          name: 'poolCreationFee',
          type: 'u64',
        },
        {
          name: 'antiSpamFee',
          type: 'u64',
        },
        {
          name: 'maxHouseEdge',
          type: 'u64',
        },
        {
          name: 'defaultPoolFee',
          type: 'u64',
        },
        {
          name: 'jackpotPayoutToUserBps',
          type: 'u64',
        },
        {
          name: 'jackpotPayoutToCreatorBps',
          type: 'u64',
        },
        {
          name: 'jackpotPayoutToPoolBps',
          type: 'u64',
        },
        {
          name: 'jackpotPayoutToGambaBps',
          type: 'u64',
        },
        {
          name: 'bonusToJackpotRatioBps',
          type: 'u64',
        },
        {
          name: 'maxPayoutBps',
          type: 'u64',
        },
        {
          name: 'poolWithdrawFeeBps',
          type: 'u64',
        },
        {
          name: 'poolCreationAllowed',
          type: 'bool',
        },
        {
          name: 'poolDepositAllowed',
          type: 'bool',
        },
        {
          name: 'poolWithdrawAllowed',
          type: 'bool',
        },
        {
          name: 'playingAllowed',
          type: 'bool',
        },
        {
          name: 'distributionRecipient',
          type: 'pubkey',
        },
      ],
    },
    {
      name: 'poolInitialize',
      discriminator: [
        37,
        10,
        195,
        69,
        4,
        213,
        88,
        173,
      ],
      accounts: [
        {
          name: 'initializer',
          writable: true,
          signer: true,
        },
        {
          name: 'gambaState',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
        },
        { name: 'underlyingTokenMint' },
        {
          name: 'pool',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'underlying_token_mint',
                account: 'Mint',
              },
              {
                kind: 'arg',
                path: 'pool_authority',
              },
            ],
          },
        },
        {
          name: 'poolUnderlyingTokenAccount',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  65,
                  84,
                  65,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'poolBonusUnderlyingTokenAccount',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  85,
                  78,
                  68,
                  69,
                  82,
                  76,
                  89,
                  73,
                  78,
                  71,
                  95,
                  84,
                  65,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'poolJackpotTokenAccount',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  74,
                  65,
                  67,
                  75,
                  80,
                  79,
                  84,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'gambaStateAta',
          writable: true,
        },
        {
          name: 'lpMint',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  76,
                  80,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'lpMintMetadata',
          writable: true,
        },
        {
          name: 'bonusMint',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'bonusMintMetadata',
          writable: true,
        },
        { name: 'associatedTokenProgram' },
        { name: 'tokenProgram' },
        { name: 'systemProgram' },
        { name: 'rent' },
        { name: 'tokenMetadataProgram' },
      ],
      args: [
        {
          name: 'poolAuthority',
          type: 'pubkey',
        },
        {
          name: 'lookupAddress',
          type: 'pubkey',
        },
      ],
    },
    {
      name: 'poolDeposit',
      discriminator: [
        26,
        109,
        164,
        79,
        207,
        145,
        204,
        217,
      ],
      accounts: [
        {
          name: 'user',
          writable: true,
          signer: true,
        },
        {
          name: 'gambaState',
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
        },
        {
          name: 'pool',
          writable: true,
        },
        {
          name: 'poolUnderlyingTokenAccount',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  65,
                  84,
                  65,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'lpMint',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  76,
                  80,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        { name: 'underlyingTokenMint' },
        {
          name: 'userUnderlyingAta',
          writable: true,
        },
        {
          name: 'userLpAta',
          writable: true,
        },
        { name: 'associatedTokenProgram' },
        { name: 'tokenProgram' },
        { name: 'systemProgram' },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'poolWithdraw',
      discriminator: [
        50,
        1,
        23,
        25,
        135,
        221,
        159,
        182,
      ],
      accounts: [
        {
          name: 'user',
          writable: true,
          signer: true,
        },
        {
          name: 'pool',
          writable: true,
        },
        {
          name: 'poolUnderlyingTokenAccount',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  65,
                  84,
                  65,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'lpMint',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  76,
                  80,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        { name: 'underlyingTokenMint' },
        {
          name: 'userUnderlyingAta',
          writable: true,
        },
        {
          name: 'userLpAta',
          writable: true,
        },
        {
          name: 'gambaState',
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
        },
        { name: 'associatedTokenProgram' },
        { name: 'tokenProgram' },
        { name: 'systemProgram' },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'poolMintBonusTokens',
      discriminator: [
        105,
        130,
        72,
        25,
        88,
        185,
        100,
        55,
      ],
      accounts: [
        {
          name: 'user',
          writable: true,
          signer: true,
        },
        { name: 'pool' },
        {
          name: 'gambaState',
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
        },
        { name: 'underlyingTokenMint' },
        {
          name: 'poolBonusUnderlyingTokenAccount',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  85,
                  78,
                  68,
                  69,
                  82,
                  76,
                  89,
                  73,
                  78,
                  71,
                  95,
                  84,
                  65,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'bonusMint',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'poolJackpotTokenAccount',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  74,
                  65,
                  67,
                  75,
                  80,
                  79,
                  84,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'userUnderlyingAta',
          writable: true,
        },
        {
          name: 'userBonusAta',
          writable: true,
        },
        { name: 'associatedTokenProgram' },
        { name: 'tokenProgram' },
        { name: 'systemProgram' },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'poolAuthorityConfig',
      discriminator: [
        58,
        12,
        184,
        118,
        14,
        99,
        110,
        17,
      ],
      accounts: [
        {
          name: 'user',
          writable: true,
          signer: true,
        },
        {
          name: 'gambaState',
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
        },
        {
          name: 'pool',
          writable: true,
        },
      ],
      args: [
        {
          name: 'minWager',
          type: 'u64',
        },
        {
          name: 'depositLimit',
          type: 'bool',
        },
        {
          name: 'depositLimitAmount',
          type: 'u64',
        },
        {
          name: 'customPoolFee',
          type: 'bool',
        },
        {
          name: 'customPoolFeeBps',
          type: 'u64',
        },
        {
          name: 'customMexPayout',
          type: 'bool',
        },
        {
          name: 'customMaxPayoutBps',
          type: 'u64',
        },
        {
          name: 'depositWhitelistRequired',
          type: 'bool',
        },
        {
          name: 'depositWhitelistAddress',
          type: 'pubkey',
        },
      ],
    },
    {
      name: 'poolGambaConfig',
      discriminator: [
        197,
        177,
        234,
        111,
        246,
        248,
        20,
        155,
      ],
      accounts: [
        {
          name: 'user',
          writable: true,
          signer: true,
        },
        {
          name: 'gambaState',
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
        },
        {
          name: 'pool',
          writable: true,
        },
      ],
      args: [
        {
          name: 'antiSpamFeeExemption',
          type: 'bool',
        },
        {
          name: 'customGambaFee',
          type: 'bool',
        },
        {
          name: 'customGambaFeeBps',
          type: 'u64',
        },
      ],
    },
    {
      name: 'playerInitialize',
      discriminator: [
        213,
        160,
        145,
        88,
        197,
        68,
        63,
        150,
      ],
      accounts: [
        {
          name: 'player',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  76,
                  65,
                  89,
                  69,
                  82,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'user',
              },
            ],
          },
        },
        {
          name: 'game',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  71,
                  65,
                  77,
                  69,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'user',
              },
            ],
          },
        },
        {
          name: 'user',
          writable: true,
          signer: true,
        },
        { name: 'systemProgram' },
      ],
      args: [],
    },
    {
      name: 'playGame',
      discriminator: [
        37,
        88,
        207,
        85,
        42,
        144,
        122,
        197,
      ],
      accounts: [
        {
          name: 'user',
          writable: true,
          signer: true,
        },
        {
          name: 'player',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  76,
                  65,
                  89,
                  69,
                  82,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'user',
              },
            ],
          },
        },
        {
          name: 'game',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  71,
                  65,
                  77,
                  69,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'user',
              },
            ],
          },
        },
        {
          name: 'pool',
          writable: true,
        },
        { name: 'underlyingTokenMint' },
        {
          name: 'bonusTokenMint',
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'userUnderlyingAta',
          writable: true,
        },
        { name: 'creator' },
        {
          name: 'creatorAta',
          writable: true,
        },
        {
          name: 'playerAta',
          writable: true,
        },
        {
          name: 'playerBonusAta',
          writable: true,
          optional: true,
        },
        {
          name: 'userBonusAta',
          writable: true,
          optional: true,
        },
        {
          name: 'gambaState',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
        },
        {
          name: 'poolJackpotTokenAccount',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  74,
                  65,
                  67,
                  75,
                  80,
                  79,
                  84,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        { name: 'systemProgram' },
        { name: 'tokenProgram' },
        { name: 'associatedTokenProgram' },
      ],
      args: [
        {
          name: 'wager',
          type: 'u64',
        },
        {
          name: 'bet',
          type: { vec: 'u32' },
        },
        {
          name: 'clientSeed',
          type: 'string',
        },
        {
          name: 'creatorFeeBps',
          type: 'u32',
        },
        {
          name: 'jackpotFeeBps',
          type: 'u32',
        },
        {
          name: 'metadata',
          type: 'string',
        },
      ],
    },
    {
      name: 'playerClose',
      discriminator: [
        26,
        155,
        61,
        179,
        53,
        157,
        80,
        30,
      ],
      accounts: [
        {
          name: 'user',
          writable: true,
          signer: true,
        },
        {
          name: 'player',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  76,
                  65,
                  89,
                  69,
                  82,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'user',
              },
            ],
          },
        },
        {
          name: 'game',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  71,
                  65,
                  77,
                  69,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'user',
              },
            ],
          },
        },
      ],
      args: [],
    },
    {
      name: 'playerClaim',
      discriminator: [
        188,
        220,
        237,
        31,
        181,
        18,
        85,
        45,
      ],
      accounts: [
        {
          name: 'user',
          writable: true,
          signer: true,
        },
        { name: 'underlyingTokenMint' },
        {
          name: 'player',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  76,
                  65,
                  89,
                  69,
                  82,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'user',
              },
            ],
          },
        },
        {
          name: 'game',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  71,
                  65,
                  77,
                  69,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'user',
              },
            ],
          },
        },
        {
          name: 'playerAta',
          writable: true,
        },
        {
          name: 'userUnderlyingAta',
          writable: true,
        },
        { name: 'systemProgram' },
        { name: 'tokenProgram' },
        { name: 'associatedTokenProgram' },
      ],
      args: [],
    },
    {
      name: 'rngSettle',
      discriminator: [
        23,
        35,
        236,
        185,
        14,
        171,
        26,
        222,
      ],
      accounts: [
        {
          name: 'rng',
          writable: true,
          signer: true,
        },
        {
          name: 'user',
          writable: true,
        },
        {
          name: 'player',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  76,
                  65,
                  89,
                  69,
                  82,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'user',
              },
            ],
          },
        },
        {
          name: 'game',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  71,
                  65,
                  77,
                  69,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'user',
              },
            ],
          },
        },
        {
          name: 'pool',
          writable: true,
        },
        { name: 'underlyingTokenMint' },
        {
          name: 'poolUnderlyingTokenAccount',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  65,
                  84,
                  65,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'poolBonusUnderlyingTokenAccount',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  85,
                  78,
                  68,
                  69,
                  82,
                  76,
                  89,
                  73,
                  78,
                  71,
                  95,
                  84,
                  65,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'playerAta',
          writable: true,
        },
        {
          name: 'userUnderlyingAta',
          writable: true,
        },
        {
          name: 'gambaState',
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
        },
        {
          name: 'gambaStateAta',
          writable: true,
        },
        { name: 'creator' },
        {
          name: 'creatorAta',
          writable: true,
        },
        {
          name: 'bonusTokenMint',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  66,
                  79,
                  78,
                  85,
                  83,
                  95,
                  77,
                  73,
                  78,
                  84,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'playerBonusAta',
          writable: true,
          optional: true,
        },
        {
          name: 'poolJackpotTokenAccount',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  80,
                  79,
                  79,
                  76,
                  95,
                  74,
                  65,
                  67,
                  75,
                  80,
                  79,
                  84,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'pool',
                account: 'Pool',
              },
            ],
          },
        },
        {
          name: 'escrowTokenAccount',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
                  69,
                  83,
                  67,
                  82,
                  79,
                  87,
                  34,
                ],
              },
              {
                kind: 'account',
                path: 'player',
                account: 'Player',
              },
            ],
          },
        },
        { name: 'systemProgram' },
        { name: 'tokenProgram' },
        { name: 'associatedTokenProgram' },
        { name: 'rent' },
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
      name: 'rngProvideHashedSeed',
      discriminator: [
        238,
        154,
        25,
        143,
        191,
        19,
        25,
        224,
      ],
      accounts: [
        {
          name: 'game',
          writable: true,
        },
        {
          name: 'rng',
          writable: true,
          signer: true,
        },
        {
          name: 'gambaState',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
        },
      ],
      args: [
        {
          name: 'nextRngSeedHashed',
          type: 'string',
        },
      ],
    },
    {
      name: 'distributeFees',
      discriminator: [
        120,
        56,
        27,
        7,
        53,
        176,
        113,
        186,
      ],
      accounts: [
        {
          name: 'signer',
          writable: true,
          signer: true,
        },
        { name: 'underlyingTokenMint' },
        {
          name: 'gambaState',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  34,
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
                  69,
                  34,
                ],
              },
            ],
          },
        },
        {
          name: 'gambaStateAta',
          writable: true,
        },
        {
          name: 'distributionRecipient',
          writable: true,
        },
        {
          name: 'distributionRecipientAta',
          writable: true,
        },
        { name: 'associatedTokenProgram' },
        { name: 'tokenProgram' },
        { name: 'systemProgram' },
      ],
      args: [
        {
          name: 'nativeSol',
          type: 'bool',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'Game',
      discriminator: [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18,
      ],
    },
    {
      name: 'Player',
      discriminator: [
        205,
        222,
        112,
        7,
        165,
        155,
        206,
        218,
      ],
    },
    {
      name: 'Pool',
      discriminator: [
        241,
        154,
        109,
        4,
        17,
        177,
        109,
        188,
      ],
    },
    {
      name: 'GambaState',
      discriminator: [
        142,
        203,
        14,
        224,
        153,
        118,
        52,
        200,
      ],
    },
  ],
  events: [
    {
      name: 'GameSettled',
      discriminator: [
        63,
        109,
        128,
        85,
        229,
        63,
        167,
        176,
      ],
    },
    {
      name: 'PoolChange',
      discriminator: [
        241,
        7,
        155,
        154,
        56,
        57,
        0,
        101,
      ],
    },
    {
      name: 'PoolCreated',
      discriminator: [
        202,
        44,
        41,
        88,
        104,
        220,
        157,
        82,
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'GenericError',
      msg: 'Something went wrong',
    },
    {
      code: 6001,
      name: 'Unauthorized',
      msg: 'Unauthorized',
    },
    {
      code: 6002,
      name: 'CustomPoolFeeExceedsLimit',
      msg: 'Custom pool fee cannot exceed 100%',
    },
    {
      code: 6003,
      name: 'CustomMaxPayoutExceedsLimit',
      msg: 'Custom max payout cannot exceed 50%',
    },
  ],
  types: [
    {
      name: 'PlayerError',
      type: {
        kind: 'enum',
        variants: [
          { name: 'NotReadyToPlay' },
          { name: 'CreatorFeeTooHigh' },
          { name: 'WagerTooSmall' },
          { name: 'TooFewBetOutcomes' },
          { name: 'TooManyBetOutcomes' },
          { name: 'PlayerAdvantage' },
          { name: 'HouseAdvantageTooHigh' },
          { name: 'MaxPayoutExceeded' },
        ],
      },
    },
    {
      name: 'RngError',
      type: {
        kind: 'enum',
        variants: [
          { name: 'Generic' },
          { name: 'InitialHashedSeedAlreadyProvided' },
          { name: 'IncorrectRngSeed' },
          { name: 'ResultNotRequested' },
        ],
      },
    },
    {
      name: 'GambaStateError',
      type: {
        kind: 'enum',
        variants: [
          { name: 'PlaysNotAllowed' },
          { name: 'DepositNotAllowed' },
          { name: 'WithdrawalNotAllowed' },
          { name: 'PoolCreationNotAllowed' },
          { name: 'DepositLimitExceeded' },
          { name: 'DepositWhitelistRequired' },
        ],
      },
    },
    {
      name: 'PoolAction',
      type: {
        kind: 'enum',
        variants: [
          { name: 'Deposit' },
          { name: 'Withdraw' },
        ],
      },
    },
    {
      name: 'GameStatus',
      type: {
        kind: 'enum',
        variants: [
          { name: 'None' },
          { name: 'NotInitialized' },
          { name: 'Ready' },
          { name: 'ResultRequested' },
        ],
      },
    },
    {
      name: 'Game',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: {
              array: [
                'u8',
                1,
              ],
            },
          },
          {
            name: 'nonce',
            type: 'u64',
          },
          {
            name: 'user',
            type: 'pubkey',
          },
          {
            name: 'tokenMint',
            type: 'pubkey',
          },
          {
            name: 'pool',
            type: 'pubkey',
          },
          {
            name: 'status',
            type: { defined: { name: 'GameStatus' } },
          },
          {
            name: 'nextRngSeedHashed',
            docs: [
              'SHA256 of coming rng_seed. Available at start of the game',
            ],
            type: 'string',
          },
          {
            name: 'rngSeed',
            docs: [
              'Is revealed by the RNG after a play',
            ],
            type: 'string',
          },
          {
            name: 'timestamp',
            type: 'i64',
          },
          {
            name: 'creator',
            type: 'pubkey',
          },
          {
            name: 'creatorMeta',
            type: 'string',
          },
          {
            name: 'wager',
            type: 'u64',
          },
          {
            name: 'underlyingUsed',
            type: 'u64',
          },
          {
            name: 'bonusUsed',
            type: 'u64',
          },
          {
            name: 'creatorFee',
            type: 'u64',
          },
          {
            name: 'gambaFee',
            type: 'u64',
          },
          {
            name: 'poolFee',
            type: 'u64',
          },
          {
            name: 'jackpotFee',
            type: 'u64',
          },
          {
            name: 'jackpotResult',
            type: 'u64',
          },
          {
            name: 'jackpotProbabilityUbps',
            type: 'u64',
          },
          {
            name: 'jackpotPayout',
            type: 'u64',
          },
          {
            name: 'clientSeed',
            type: 'string',
          },
          {
            name: 'bet',
            type: { vec: 'u32' },
          },
          {
            name: 'result',
            type: 'u64',
          },
          {
            name: 'points',
            type: 'bool',
          },
          {
            name: 'pointsAuthority',
            type: 'pubkey',
          },
          {
            name: 'metadata',
            type: 'string',
          },
        ],
      },
    },
    {
      name: 'Player',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: {
              array: [
                'u8',
                1,
              ],
            },
          },
          {
            name: 'user',
            type: 'pubkey',
          },
          {
            name: 'nonce',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'Pool',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: {
              array: [
                'u8',
                1,
              ],
            },
          },
          {
            name: 'lookupAddress',
            type: 'pubkey',
          },
          {
            name: 'poolAuthority',
            type: 'pubkey',
          },
          {
            name: 'underlyingTokenMint',
            type: 'pubkey',
          },
          {
            name: 'antiSpamFeeExempt',
            type: 'bool',
          },
          {
            name: 'minWager',
            type: 'u64',
          },
          {
            name: 'plays',
            type: 'u64',
          },
          {
            name: 'liquidityCheckpoint',
            type: 'u64',
          },
          {
            name: 'depositLimit',
            type: 'bool',
          },
          {
            name: 'depositLimitAmount',
            type: 'u64',
          },
          {
            name: 'customPoolFee',
            type: 'bool',
          },
          {
            name: 'customPoolFeeBps',
            type: 'u64',
          },
          {
            name: 'customGambaFee',
            type: 'bool',
          },
          {
            name: 'customGambaFeeBps',
            type: 'u64',
          },
          {
            name: 'customMaxPayout',
            type: 'bool',
          },
          {
            name: 'customMaxPayoutBps',
            type: 'u64',
          },
          {
            name: 'customBonusTokenMint',
            type: 'pubkey',
          },
          {
            name: 'customBonusToken',
            type: 'bool',
          },
          {
            name: 'customMaxCreatorFee',
            type: 'bool',
          },
          {
            name: 'customMaxCreatorFeeBps',
            type: 'u64',
          },
          {
            name: 'depositWhitelistRequired',
            type: 'bool',
          },
          {
            name: 'depositWhitelistAddress',
            type: 'pubkey',
          },
        ],
      },
    },
    {
      name: 'GambaState',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'pubkey',
          },
          {
            name: 'rngAddress',
            type: 'pubkey',
          },
          {
            name: 'rngAddress2',
            type: 'pubkey',
          },
          {
            name: 'antiSpamFee',
            type: 'u64',
          },
          {
            name: 'gambaFeeBps',
            type: 'u64',
          },
          {
            name: 'poolCreationFee',
            type: 'u64',
          },
          {
            name: 'defaultPoolFee',
            type: 'u64',
          },
          {
            name: 'jackpotPayoutToUserBps',
            type: 'u64',
          },
          {
            name: 'jackpotPayoutToCreatorBps',
            type: 'u64',
          },
          {
            name: 'jackpotPayoutToPoolBps',
            type: 'u64',
          },
          {
            name: 'jackpotPayoutToGambaBps',
            type: 'u64',
          },
          {
            name: 'bonusToJackpotRatioBps',
            type: 'u64',
          },
          {
            name: 'maxHouseEdgeBps',
            type: 'u64',
          },
          {
            name: 'maxCreatorFeeBps',
            type: 'u64',
          },
          {
            name: 'maxPayoutBps',
            type: 'u64',
          },
          {
            name: 'poolWithdrawFeeBps',
            type: 'u64',
          },
          {
            name: 'poolCreationAllowed',
            type: 'bool',
          },
          {
            name: 'poolDepositAllowed',
            type: 'bool',
          },
          {
            name: 'poolWithdrawAllowed',
            type: 'bool',
          },
          {
            name: 'playingAllowed',
            type: 'bool',
          },
          {
            name: 'distributionRecipient',
            type: 'pubkey',
          },
          {
            name: 'bump',
            type: {
              array: [
                'u8',
                1,
              ],
            },
          },
        ],
      },
    },
    {
      name: 'GameSettled',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'user',
            type: 'pubkey',
          },
          {
            name: 'pool',
            type: 'pubkey',
          },
          {
            name: 'tokenMint',
            type: 'pubkey',
          },
          {
            name: 'creator',
            type: 'pubkey',
          },
          {
            name: 'creatorFee',
            type: 'u64',
          },
          {
            name: 'gambaFee',
            type: 'u64',
          },
          {
            name: 'poolFee',
            type: 'u64',
          },
          {
            name: 'jackpotFee',
            type: 'u64',
          },
          {
            name: 'underlyingUsed',
            type: 'u64',
          },
          {
            name: 'bonusUsed',
            type: 'u64',
          },
          {
            name: 'wager',
            type: 'u64',
          },
          {
            name: 'payout',
            type: 'u64',
          },
          {
            name: 'multiplierBps',
            type: 'u32',
          },
          {
            name: 'payoutFromBonusPool',
            type: 'u64',
          },
          {
            name: 'payoutFromNormalPool',
            type: 'u64',
          },
          {
            name: 'jackpotProbabilityUbps',
            type: 'u64',
          },
          {
            name: 'jackpotResult',
            type: 'u64',
          },
          {
            name: 'nonce',
            type: 'u64',
          },
          {
            name: 'clientSeed',
            type: 'string',
          },
          {
            name: 'resultIndex',
            type: 'u64',
          },
          {
            name: 'bet',
            type: { vec: 'u32' },
          },
          {
            name: 'jackpotPayoutToUser',
            type: 'u64',
          },
          {
            name: 'poolLiquidity',
            type: 'u64',
          },
          {
            name: 'rngSeed',
            type: 'string',
          },
          {
            name: 'nextRngSeedHashed',
            type: 'string',
          },
          {
            name: 'metadata',
            type: 'string',
          },
        ],
      },
    },
    {
      name: 'PoolChange',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'user',
            type: 'pubkey',
          },
          {
            name: 'pool',
            type: 'pubkey',
          },
          {
            name: 'tokenMint',
            type: 'pubkey',
          },
          {
            name: 'action',
            type: { defined: { name: 'PoolAction' } },
          },
          {
            name: 'amount',
            type: 'u64',
          },
          {
            name: 'postLiquidity',
            type: 'u64',
          },
          {
            name: 'lpSupply',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'PoolCreated',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'user',
            type: 'pubkey',
          },
          {
            name: 'authority',
            type: 'pubkey',
          },
          {
            name: 'pool',
            type: 'pubkey',
          },
          {
            name: 'tokenMint',
            type: 'pubkey',
          },
        ],
      },
    },
  ],
}
