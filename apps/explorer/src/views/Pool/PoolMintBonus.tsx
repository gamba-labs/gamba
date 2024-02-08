import { Button, Flex, Grid, Heading, IconButton, Text, TextField } from "@radix-ui/themes"
import { decodeAta, getPoolBonusAddress, getUserWsolAccount, isNativeMint, wrapSol } from "gamba-core-v2"
import { useAccount, useGambaProvider, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import React from "react"
import { mutate } from "swr"

import { UiPool } from "@/views/Dashboard/PoolList"
import { TokenValue2 } from "@/components/TokenValue2"
import { useBalance, useToast } from "@/hooks"
import { useTokenMeta } from "@/hooks/useTokenMeta"

export function PoolMintBonus({ pool }: { pool: UiPool }) {
  const gamba = useGambaProvider()
  const [amountText, setAmountText] = React.useState("")
  const sendTransaction = useSendTransaction()
  const user = useWalletAddress()
  const toast = useToast()
  const token = useTokenMeta(pool.underlyingTokenMint)
  const balances = useBalance(pool.underlyingTokenMint)
  const wSolAccount = useAccount(getUserWsolAccount(user), decodeAta)

  const mintBonusTokens = async () => {
    try {
      const amount = Math.round(Number(amountText) * (10 ** token.decimals))

      const { publicKey, state } = pool
      const underlyingTokenMint = state.underlyingTokenMint

      const poolBonusMint = getPoolBonusAddress(publicKey)

      const mintInstructions = gamba.mintBonusTokens(
        publicKey,
        underlyingTokenMint,
        amount,
      )

      if (isNativeMint(underlyingTokenMint)) {
        const wrapSolInstructions = await wrapSol(
          user,
          amount,
          !wSolAccount,
        )
        return sendTransaction([...wrapSolInstructions, mintInstructions], { confirmation: "confirmed" })
      }

      await sendTransaction(mintInstructions, { confirmation: "confirmed" })

      mutate(`pool-${publicKey.toBase58()}`)

      toast({ title: "Bonus Tokens Minted", description: "" })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Grid gap="2">
      <Heading>
        Mint bonus tokens
      </Heading>
      <Text color="gray">
        Bonus tokens can be used as free plays.
        <ul>
          <li>The tokens can only be used by playing in this specific pool.</li>
          <li>The tokens can not be swapped back to {token.symbol}.</li>
        </ul>
      </Text>
      <TextField.Root>
        <TextField.Input
          placeholder="Amount"
          value={amountText}
          size="3"
          onChange={event => setAmountText(event.target.value)}
        />
        <TextField.Slot>
          <IconButton onClick={() => setAmountText(String(balances.balance / (10 ** token.decimals)))} size="1" variant="ghost">
            MAX
          </IconButton>
        </TextField.Slot>
      </TextField.Root>
      <Flex justify="between">
        <Text size="2" color="gray">
          Balance
        </Text>
        <Text size="2">
          <TokenValue2 exact amount={balances.balance} mint={pool.underlyingTokenMint} />
        </Text>
      </Flex>
      <Button size="3" variant="soft" onClick={mintBonusTokens}>
        Mint
      </Button>
    </Grid>
  )
}
