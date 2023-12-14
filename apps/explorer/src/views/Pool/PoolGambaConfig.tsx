import * as anchor from "@coral-xyz/anchor"
import { Button, Flex, Grid, Heading, Text, TextField } from "@radix-ui/themes"
import { useWallet } from "@solana/wallet-adapter-react"
import { BPS_PER_WHOLE } from "gamba-core-v2"
import { useGambaProgram, useSendTransaction } from "gamba-react-v2"
import React, { useState } from "react"
import { mutate } from "swr"

import { UiPool } from "@/PoolList"

const Thing = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Grid columns="2">
    <Text>{title}</Text>
    {children}
  </Grid>
)

interface PoolConfigInput {
  antiSpamFeeExemption: boolean
  customGambaFee: string
}

export default function PoolGambaConfigDialog({ pool }: { pool: UiPool }) {
  const sendTx = useSendTransaction()
  const program = useGambaProgram()
  const { publicKey } = useWallet()

  const [input, setInput] = useState<PoolConfigInput>({
    antiSpamFeeExemption: pool.state.antiSpamFeeExempt,
    customGambaFee: String(pool.state.customGambaFeeBps.toNumber() / BPS_PER_WHOLE),
  })

  const updateInput = (update: Partial<PoolConfigInput>) => {
    setInput(prevInput => ({ ...prevInput, ...update }))
  }

  const updateConfig = async () => {
    const {
      antiSpamFeeExemption,
      customGambaFee,
    } = input

    const customGambaFeeBps = parseFloat(customGambaFee) * BPS_PER_WHOLE

    await sendTx(
      program.methods
        .poolGambaConfig(
          antiSpamFeeExemption,
          new anchor.BN(customGambaFeeBps),
        )
        .accounts({ user: publicKey!, pool: pool.publicKey })
        .instruction(),
      { confirmation: "confirmed" },
    )
    mutate("pool-" + pool.publicKey.toBase58())
  }

  return (
    <>
      <Heading>Gamba Config</Heading>
      <Flex gap="2" direction="column">
        <Thing title="Anti Spam Fee Exemption">
          <input
            type="checkbox"
            checked={input.antiSpamFeeExemption}
            onChange={e => updateInput({ antiSpamFeeExemption: e.target.checked })}
          />
        </Thing>
        <Thing title="Custom Gamba Fee (%)">
          <TextField.Root>
            <TextField.Input
              value={input.customGambaFee}
              onChange={e => updateInput({ customGambaFee: e.target.value })}
              type="number"
              step="0.01"
            />
          </TextField.Root>
        </Thing>
        <Button onClick={updateConfig}>
          Update
        </Button>
      </Flex>
    </>
  )
}
