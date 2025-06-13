export type ReferralIdl = {
  'address': 'RefwFk2PPNd9bPehSyAkrkrehSHkvz6mTAHTNe8v9vH',
  'metadata': {
    'name': 'refer_program',
    'version': '0.1.0',
    'spec': '0.1.0'
  },
  'instructions': [
    {
      'name': 'configReferAccount',
      'discriminator': [
        239,
        224,
        113,
        115,
        108,
        177,
        31,
        129
      ],
      'accounts': [
        {
          'name': 'authority',
          'writable': true,
          'signer': true
        },
        {
          'name': 'referAccount',
          'writable': true
        },
        {
          'name': 'creator'
        },
        {
          'name': 'systemProgram'
        }
      ],
      'args': [
        {
          'name': 'referrer',
          'type': 'pubkey'
        }
      ]
    },
    {
      'name': 'closeReferAccount',
      'discriminator': [
        63,
        205,
        62,
        118,
        16,
        139,
        150,
        134
      ],
      'accounts': [
        {
          'name': 'authority',
          'writable': true,
          'signer': true
        },
        {
          'name': 'referAccount',
          'writable': true
        },
        {
          'name': 'creator'
        },
        {
          'name': 'systemProgram'
        }
      ],
      'args': []
    }
  ],
  'accounts': [
    {
      'name': 'referAccount',
      'discriminator': [
        60,
        125,
        244,
        175,
        131,
        109,
        101,
        246
      ]
    }
  ],
  'types': [
    {
      'name': 'ReferAccount',
      'type': {
        'kind': 'struct',
        'fields': [
          {
            'name': 'referrer',
            'type': 'pubkey'
          }
        ],
        'variants': []
      }
    }
  ],
  'errors': [],
  'events': []
}

export const REFERRAL_IDL: ReferralIdl = {
  address: 'RefwFk2PPNd9bPehSyAkrkrehSHkvz6mTAHTNe8v9vH',
  metadata: {
    name: 'refer_program',
    version: '0.1.0',
    spec: '0.1.0',
  },
  instructions: [
    {
      name: 'configReferAccount',
      discriminator: [
        239,
        224,
        113,
        115,
        108,
        177,
        31,
        129,
      ],
      accounts: [
        {
          name: 'authority',
          writable: true,
          signer: true,
        },
        {
          name: 'referAccount',
          writable: true,
        },
        { name: 'creator' },
        { name: 'systemProgram' },
      ],
      args: [
        {
          name: 'referrer',
          type: 'pubkey',
        },
      ],
    },
    {
      name: 'closeReferAccount',
      discriminator: [
        63,
        205,
        62,
        118,
        16,
        139,
        150,
        134,
      ],
      accounts: [
        {
          name: 'authority',
          writable: true,
          signer: true,
        },
        {
          name: 'referAccount',
          writable: true,
        },
        { name: 'creator' },
        { name: 'systemProgram' },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'referAccount',
      discriminator: [
        60,
        125,
        244,
        175,
        131,
        109,
        101,
        246,
      ],
    },
  ],
  types: [
    {
      name: 'ReferAccount',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'referrer',
            type: 'pubkey',
          },
        ],
        variants: [],
      },
    },
  ],
  errors: [],
  events: [],
}
