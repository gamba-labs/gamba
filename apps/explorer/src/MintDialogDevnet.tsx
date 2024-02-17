import * as anchor from "@coral-xyz/anchor"
import { Button, Dialog, Flex, Grid, Tabs, Text, TextField } from "@radix-ui/themes"
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useGambaProgram } from "gamba-react-v2"
import React from "react"

import { useToastStore } from "@/hooks"

const idl = {
  version: "0.1.0",
  name: "token_maker",
  instructions: [
    {
      name: "createToken",
      accounts: [
        {
          name: "metadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "mint",
              },
              {
                kind: "arg",
                type: "string",
                path: "token_name",
              },
            ],
          },
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenMetadataProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "tokenName",
          type: "string",
        },
        {
          name: "decimalsInput",
          type: "u8",
        },
      ],
    },
    {
      name: "mintToken",
      accounts: [
        {
          name: "mint",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "mint",
              },
              {
                kind: "arg",
                type: "string",
                path: "token_name",
              },
            ],
          },
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "userAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "tokenName",
          type: "string",
        },
        {
          name: "inputAmount",
          type: "u64",
        },
      ],
    },
  ],
  metadata: { address: "6iJcUPki2Md7BUpGyXCpDzJUzbVmYBVPiiDmRAbaMraR" },
}

const programID = new PublicKey(idl.metadata.address)

function MintPreToken() {
  const wallet = useWallet()
  const [tokenName, setTokenName] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [amount, setAmount] = React.useState("10000")
  const addToast = useToastStore(state => state.add)
  const gambaProgram = useGambaProgram()

  const mintToken = async () => {
    try {
      setLoading(true)
      const program = new anchor.Program(idl as any, programID, gambaProgram.provider)
      const mint = PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), Buffer.from(tokenName)],
        program.programId,
      )[0]

      const METADATA_SEED = "metadata"
      const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID,
      )

      const user_ata = getAssociatedTokenAddressSync(
        mint,
        wallet.publicKey!,
      )

      const multipliedAmount = new anchor.BN(BigInt(amount) * BigInt(1e9))

      // const multipliedAmount = new anchor.BN(BigInt(amount) * BigInt(1e9))

      const tx = await program.methods
        .mintToken(tokenName, multipliedAmount)
        .accounts({
          mint: mint,
          payer: wallet.publicKey,
          userAta: user_ata,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .rpc()

      console.log("Transaction successful:", tx)

      addToast({
        title: "Minted",
        description: `${tokenName} token minted successfully.`,
      })
    } catch (err) {
      console.error(err)
      addToast({
        title: "❌ Fail",
        description: `Failed to mint ${tokenName}.`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Grid gap="2">
      <Text size="2" color="gray">
        This view is for minting tokens has already been created. To create a brand new token, switch tab to "Create"
      </Text>
      <TextField.Input
        value={tokenName}
        onChange={e => setTokenName(e.target.value)}
        placeholder="Token Name"
      />
      <Flex gap="2">
        <Button variant="soft" disabled={loading} onClick={() => setTokenName("USDC")}>USDC</Button>
        <Button variant="soft" disabled={loading} onClick={() => setTokenName("GAMBA")}>GAMBA</Button>
      </Flex>
      <TextField.Input
        value={amount}
        onChange={e => setAmount(e.target.value)}
        onBlur={(e) => {
          try {
            const b = BigInt(e.target.value ?? 0)
            setAmount(String(b))
          } catch {
            setAmount("0")
          }
        }}
        placeholder="Amount"
      />

      <Button disabled={loading || !tokenName} onClick={mintToken}>
        Mint token
      </Button>
    </Grid>
  )
}

function Custom() {
  const wallet = useWallet()
  const [tokenName, setTokenName] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [decimalsInput, setDecimalsInput] = React.useState(9)
  const addToast = useToastStore(state => state.add)

  const gambaProgram = useGambaProgram()

  const createToken = async () => {
    try {
      setLoading(true)
      const program = new anchor.Program(idl as any, programID, gambaProgram.provider)
      const mint = PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), Buffer.from(tokenName)],
        program.programId,
      )[0]

      const METADATA_SEED = "metadata"
      const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID,
      )
      const tx = await program.methods
        .createToken(tokenName, decimalsInput)
        .accounts({
          metadata: metadataAddress,
          mint: mint,
          payer: wallet.publicKey!,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .rpc()

      console.log("Transaction successful:", tx)

      addToast({
        title: "Created",
        description: `${tokenName} token created successfully.`,
      })
    } catch (err) {
      addToast({
        title: "❌ Fail",
        description: `Failed to create ${tokenName}. Maybe it has already been created?`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Grid gap="2">
      <Text size="2" color="gray">
          Initialize a token. Once created, you can mint them in the "Mint" tab.
      </Text>
      <TextField.Input
        value={tokenName}
        onChange={e => setTokenName(e.target.value)}
        placeholder="Token Name"
      />
      <TextField.Input
        type="number"
        min="0"
        max="9"
        value={decimalsInput}
        onChange={e => setDecimalsInput(Number(e.target.value))}
        placeholder="Decimals (0-9)"
      />

      <Button disabled={loading || !tokenName} onClick={createToken}>
        Initialize Token
      </Button>
    </Grid>
  )
}

function MintDialogDevnet() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="soft">Mint Tokens</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Tabs.Root defaultValue="mint">
          <Tabs.List>
            <Tabs.Trigger value="mint">Mint</Tabs.Trigger>
            <Tabs.Trigger value="create">Create</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="mint">
            <MintPreToken />
          </Tabs.Content>
          <Tabs.Content value="create">
            <Custom />
          </Tabs.Content>
        </Tabs.Root>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default MintDialogDevnet
