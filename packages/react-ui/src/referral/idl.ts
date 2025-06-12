export type ReferralIdl = {
  version: '0.1.0';
  name: 'refer_program';
  metadata: { address: string };
  instructions: ({
    name: 'configReferAccount';
    accounts: { name: string; isMut: boolean; isSigner: boolean }[];
    args: { name: 'referrer'; type: 'publicKey' }[];
  } | {
    name: 'closeReferAccount';
    accounts: { name: string; isMut: boolean; isSigner: boolean }[];
    args: [];
  })[];
  accounts: {
    name: 'referAccount';
    type: {
      kind: 'struct';
      fields: { name: 'referrer'; type: 'publicKey' }[];
    };
  }[];
};

export const REFERRAL_IDL: ReferralIdl = {
  version: '0.1.0',
  name: 'refer_program',
  metadata: { address: 'RefwFk2PPNd9bPehSyAkrkrehSHkvz6mTAHTNe8v9vH' },
  instructions: [
    {
      name: 'configReferAccount',
      accounts: [
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'referAccount', isMut: true, isSigner: false },
        { name: 'creator', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'referrer', type: 'publicKey' }],
    },
    {
      name: 'closeReferAccount',
      accounts: [
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'referAccount', isMut: true, isSigner: false },
        { name: 'creator', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'referAccount',
      type: {
        kind: 'struct',
        fields: [{ name: 'referrer', type: 'publicKey' }],
      },
    },
  ],
}
