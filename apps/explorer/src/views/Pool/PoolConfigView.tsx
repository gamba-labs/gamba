import * as anchor from "@coral-xyz/anchor"
import { Button, Card, Flex, Grid, Heading, Text, TextField } from "@radix-ui/themes"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { BPS_PER_WHOLE, decodeGambaState, getGambaStateAddress } from "gamba-core-v2"
import { useAccount, useGambaProgram, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import { useTokenMeta } from "gamba-react-ui-v2"
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
  poolDepositLimit: string;
  poolMinWager: string;
  customPoolFee: string;
  customJackpotFee: string;
  customMaxCreatorFee: string;
  customMaxPayout: string;
  depositWhitelistRequired: boolean;
  depositWhitelistAddress: string;
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
    poolDepositLimit: String(pool.state.depositLimit.toNumber() / Math.pow(10, token.decimals)),
    poolMinWager: String(pool.state.minWager.toNumber() / Math.pow(10, token.decimals)),
    customPoolFee: String(pool.state.customPoolFeeBps.toNumber() / BPS_PER_WHOLE),
    customJackpotFee: String(pool.state.customJackpotFeeBps.toNumber() / BPS_PER_WHOLE),
    customMaxCreatorFee: String(pool.state.customMaxCreatorFeeBps.toNumber() / BPS_PER_WHOLE),
    customMaxPayout: String(pool.state.customMaxPayoutBps.toNumber() / BPS_PER_WHOLE),
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
      customPoolFee,
      customMaxCreatorFee,
      customMaxPayout,
      depositWhitelistRequired,
      depositWhitelistAddress,
    } = input

    const poolDepositLimitInSmallestUnit = handleDecimalChange(input.poolDepositLimit, token.decimals)
    const poolMinWagerInSmallestUnit = handleDecimalChange(input.poolMinWager, token.decimals)
    const customPoolFeeBps = parseFloat(customPoolFee) * BPS_PER_WHOLE
    const customMaxCreatorFeeBps = parseFloat(customMaxCreatorFee) * BPS_PER_WHOLE
    const customMaxPayoutBps = parseFloat(customMaxPayout) * BPS_PER_WHOLE

    const depositWhitelistPublicKey = new PublicKey(depositWhitelistAddress)

    await sendTx(
      program.methods
        .poolAuthorityConfig(
          new anchor.BN(poolDepositLimitInSmallestUnit),
          new anchor.BN(poolMinWagerInSmallestUnit),
          new anchor.BN(customPoolFeeBps),
          new anchor.BN(customMaxCreatorFeeBps),
          new anchor.BN(customMaxPayoutBps),
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
          <Thing title="Deposit Limit">
            <TextField.Root>
              <TextField.Input
                value={input.poolDepositLimit}
                onChange={e => updateInput({ poolDepositLimit: e.target.value })}
              />
            </TextField.Root>
          </Thing>
          <Thing title="Min Wager Amount">
            <TextField.Root>
              <TextField.Input
                value={input.poolMinWager}
                onChange={e => updateInput({ poolMinWager: e.target.value })}
              />
            </TextField.Root>
          </Thing>
          <Thing title="Custom Fee (%)">
            <TextField.Root>
              <TextField.Input
                value={input.customPoolFee}
                onChange={e => updateInput({ customPoolFee: e.target.value })}
                type="number"
                step="0.01"
              />
            </TextField.Root>
          </Thing>
          <Thing title="Max Creator Fee (%)">
            <TextField.Root>
              <TextField.Input
                value={input.customMaxCreatorFee}
                onChange={e => updateInput({ customMaxCreatorFee: e.target.value })}
                type="number"
                step="0.01"
              />
            </TextField.Root>
          </Thing>
          <Thing title="Max Payout (%)">
            <TextField.Root>
              <TextField.Input
                value={input.customMaxPayout}
                onChange={e => updateInput({ customMaxPayout: e.target.value })}
                type="number"
                step="0.01"
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
