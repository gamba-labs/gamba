import * as anchor from "@coral-xyz/anchor"
import { Button, Card, Flex, Grid, Heading, Text, TextField } from "@radix-ui/themes"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { BPS_PER_WHOLE, decodeGambaState, getGambaStateAddress } from "gamba-core-v2"
import { useTokenMeta } from "gamba-react-ui-v2"
import { useAccount, useGambaProgram, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import React, { useState } from "react"
import { useParams } from "react-router-dom"
import useSWR, { mutate } from "swr"

import { Spinner } from "@/components/Spinner"
import { fetchPool, UiPool } from "@/PoolList"

import PoolGambaConfigDialog from "./PoolGambaConfig"
import { PoolHeader } from "./PoolView"

const Thing = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Grid columns="2">
    <Text>{title}</Text>
    {children}
  </Grid>
)

interface PoolConfigInput {
  minWager: string
  depositLimit: boolean
  depositLimitAmount: string
  customPoolFee: boolean
  customPoolFeeBps: string
  customMaxPayout: boolean
  customMaxPayoutBps: string
  depositWhitelistRequired: boolean
  depositWhitelistAddress: string
}

function PoolConfigDialog({ pool }: { pool: UiPool }) {
  const sendTx = useSendTransaction()
  const program = useGambaProgram()
  const { publicKey } = useWallet()
  const token = useTokenMeta(pool.state.underlyingTokenMint)

  const gambaState = useAccount(getGambaStateAddress(), decodeGambaState)
  const userPublicKey = useWalletAddress()
  const isPoolAuthority = userPublicKey && pool?.state?.poolAuthority?.equals(userPublicKey)
  const isGambaStateAuthority = userPublicKey && gambaState?.authority?.equals(userPublicKey)

  const [input, setInput] = useState<PoolConfigInput>({
    minWager: String(pool.state.minWager.toNumber() / Math.pow(10, token.decimals)),
    depositLimit: pool.state.depositLimit,
    depositLimitAmount: String(pool.state.depositLimitAmount.toNumber() / Math.pow(10, token.decimals)),
    customPoolFee: pool.state.customPoolFee,
    customPoolFeeBps: String(pool.state.customPoolFeeBps.toNumber() / BPS_PER_WHOLE),
    customMaxPayout: pool.state.customMaxPayout,
    customMaxPayoutBps: String(pool.state.customMaxPayoutBps.toNumber() / BPS_PER_WHOLE),
    depositWhitelistRequired: pool.state.depositWhitelistRequired,
    depositWhitelistAddress: pool.state.depositWhitelistAddress.toBase58(),
  })

  const updateInput = (update: Partial<PoolConfigInput>) => {
    setInput(prevInput => ({ ...prevInput, ...update }))
  }

  const handleDecimalChange = (value: string, decimals: number) => {
    return String(parseFloat(value) * Math.pow(10, decimals))
  }

  const updateConfig = async () => {
    const {
      depositLimit,
      customPoolFee,
      customPoolFeeBps,
      customMaxPayout,
      customMaxPayoutBps,
      depositWhitelistRequired,
      depositWhitelistAddress,
    } = input

    const poolDepositLimitInSmallestUnit = handleDecimalChange(input.depositLimitAmount, token.decimals)
    const poolMinWagerInSmallestUnit = handleDecimalChange(input.minWager, token.decimals)
    const customPoolFeeBpsValue = parseFloat(customPoolFeeBps) * BPS_PER_WHOLE
    const customMaxPayoutBpsValue = parseFloat(customMaxPayoutBps) * BPS_PER_WHOLE

    const depositWhitelistPublicKey = new PublicKey(depositWhitelistAddress)

    await sendTx(
      program.methods
        .poolAuthorityConfig(
          new anchor.BN(poolMinWagerInSmallestUnit),
          depositLimit,
          new anchor.BN(poolDepositLimitInSmallestUnit),
          customPoolFee,
          new anchor.BN(customPoolFeeBpsValue),
          customMaxPayout,
          new anchor.BN(customMaxPayoutBpsValue),
          depositWhitelistRequired,
          depositWhitelistPublicKey,
        )
        .accounts({ user: publicKey!, pool: pool.publicKey })
        .instruction(),
      { confirmation: "confirmed" },
    )
    mutate("pool-" + pool.publicKey.toBase58())
  }

  return (
    <>
      <Card size="3">
        <Heading>Config</Heading>
        <Flex gap="2" direction="column">
          <Thing title="Min Wager Amount">
            <TextField.Root>
              <TextField.Input
                value={input.minWager}
                onChange={e => updateInput({ minWager: e.target.value })}
              />
            </TextField.Root>
          </Thing>
          <Thing title="Deposit Limit Enabled">
            <input
              type="checkbox"
              checked={input.depositLimit}
              onChange={e => updateInput({ depositLimit: e.target.checked })}
            />
          </Thing>
          <Thing title="Deposit Limit Amount">
            <TextField.Root>
              <TextField.Input
                value={input.depositLimitAmount}
                onChange={e => updateInput({ depositLimitAmount: e.target.value })}
              />
            </TextField.Root>
          </Thing>
          <Thing title="Custom Pool Fee Enabled">
            <input
              type="checkbox"
              checked={input.customPoolFee}
              onChange={e => updateInput({ customPoolFee: e.target.checked })}
            />
          </Thing>
          <Thing title="Custom Pool Fee (BPS)">
            <TextField.Root>
              <TextField.Input
                value={input.customPoolFeeBps}
                onChange={e => updateInput({ customPoolFeeBps: e.target.value })}
                type="number"
              />
            </TextField.Root>
          </Thing>
          <Thing title="Custom max Payout Enabled">
            <input
              type="checkbox"
              checked={input.customMaxPayout}
              onChange={e => updateInput({ customMaxPayout: e.target.checked })}
            />
          </Thing>
          <Thing title="Max Payout (BPS)">
            <TextField.Root>
              <TextField.Input
                value={input.customMaxPayoutBps}
                onChange={e => updateInput({ customMaxPayoutBps: e.target.value })}
                type="number"
              />
            </TextField.Root>
          </Thing>
          <Thing title="Deposit Whitelist Required">
            <input
              type="checkbox"
              checked={input.depositWhitelistRequired}
              onChange={e => updateInput({ depositWhitelistRequired: e.target.checked })}
            />
          </Thing>
          <Thing title="Whitelist Address">
            <TextField.Root>
              <TextField.Input
                value={input.depositWhitelistAddress}
                onChange={e => updateInput({ depositWhitelistAddress: e.target.value })}
              />
            </TextField.Root>
          </Thing>
          <Button onClick={updateConfig}>
            Update
          </Button>
        </Flex>
      </Card>
      {isGambaStateAuthority && (
        <Card size="3">
          <PoolGambaConfigDialog pool={pool} />
        </Card>
      )}
    </>
  )
}

export default function PoolConfigureView() {
  const program = useGambaProgram()
  const params = useParams<{poolId: string}>()
  const poolId = React.useMemo(() => new PublicKey(params.poolId!), [params.poolId])
  const { data, isLoading } = useSWR("pool-" + params.poolId!, () => fetchPool(program.provider.connection, poolId))

  if (isLoading) {
    return (
      <Flex align="center" justify="center" p="4">
        <Spinner />
      </Flex>
    )
  }
  return (
    <>
      {data && (
        <Grid gap="4">
          <Flex justify="between" align="end" py="4">
            <PoolHeader pool={data} />
          </Flex>
          <PoolConfigDialog pool={data} />
        </Grid>
      )}
    </>
  )
}
