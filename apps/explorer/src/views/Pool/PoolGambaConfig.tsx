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
  antiSpamFeeExemption: boolean;
  customGambaFeeEnabled: boolean;
  customGambaFeePercent: string; // Representing the fee as a percentage
}

export default function PoolGambaConfigDialog({ pool }: { pool: UiPool }) {
  const sendTx = useSendTransaction()
  const program = useGambaProgram()
  const { publicKey } = useWallet()

  const [input, setInput] = useState<PoolConfigInput>({
    antiSpamFeeExemption: pool.state.antiSpamFeeExempt,
    customGambaFeeEnabled: pool.state.customGambaFee,
    customGambaFeePercent: String(pool.state.customGambaFeeBps / BPS_PER_WHOLE * 100), // Convert basis points to percentage
  })

  const updateInput = (update: Partial<PoolConfigInput>) => {
    setInput(prevInput => ({ ...prevInput, ...update }))
  }

  const updateConfig = async () => {
    const { antiSpamFeeExemption, customGambaFeeEnabled, customGambaFeePercent } = input

    // Convert the input percentage to basis points
    const customGambaFeeBps = parseFloat(customGambaFeePercent) / 100 * BPS_PER_WHOLE

    await sendTx(
      program.methods
        .poolGambaConfig(
          antiSpamFeeExemption,
          customGambaFeeEnabled,
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
        <Thing title="Enable Custom Gamba Fee">
          <input
            type="checkbox"
            checked={input.customGambaFeeEnabled}
            onChange={e => updateInput({ customGambaFeeEnabled: e.target.checked })}
          />
        </Thing>
        <Thing title="Custom Gamba Fee (%)">
          <TextField.Root>
            <TextField.Input
              value={input.customGambaFeePercent}
              onChange={e => updateInput({ customGambaFeePercent: e.target.value })}
              type="number"
              step="0.01"
              disabled={!input.customGambaFeeEnabled}
              placeholder="Enter fee percentage"
            />
          </TextField.Root>
        </Thing>
        <Button onClick={updateConfig}>Update</Button>
      </Flex>
    </>
  )
}
