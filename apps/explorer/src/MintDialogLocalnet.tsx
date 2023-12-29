import { Button, Dialog, Grid, Text, TextField } from "@radix-ui/themes"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Keypair } from "@solana/web3.js"
import React from "react"

import { useToastStore } from "@/hooks"

import { setupSplToken } from "./utils"

function MintDialogLocalnet() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [amount, setAmount] = React.useState(10000)
  const [decimals, setDecimals] = React.useState(9)
  const [secretKey, setPrivateKey] = React.useState("[232,212,11,221,197,94,215,241,218,19,81,5,90,181,157,104,218,104,188,208,178,163,152,21,161,150,105,248,39,196,91,235,6,221,33,41,245,226,78,236,3,48,102,231,230,160,87,51,215,252,118,80,56,42,91,110,150,41,207,255,106,252,194,64]")
  const addToast = useToastStore(state => state.add)

  const submit = async () => {
    try {
      setLoading(true)
      await setupSplToken(
        connection,
        wallet.publicKey!,
        decimals,
        amount,
        secretKey ? Keypair.fromSecretKey(new Uint8Array(JSON.parse(secretKey))) : undefined,
      )
      setOpen(false)
      addToast({
        title: "Created",
        description: "Token created.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="soft">
          Mint Tokens
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Grid gap="2">
          <Text size="2" color="gray">Amount</Text>
          <TextField.Input
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            placeholder="Amount"
          />
          <Text size="2" color="gray">Decimals</Text>
          <TextField.Input
            type="number"
            value={decimals}
            onChange={e => setDecimals(Number(e.target.value))}
            placeholder="Decimals"
          />
          <Text size="2" color="gray">Mint private key (Empty for random)</Text>
          <TextField.Input
            value={secretKey}
            onChange={e => setPrivateKey(e.target.value)}
            placeholder="Private Key"
          />
          <Button disabled={loading} onClick={submit}>
            {loading ? "Creating" : "Create"}
          </Button>
        </Grid>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default MintDialogLocalnet
