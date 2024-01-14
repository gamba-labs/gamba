import { Button, Flex, Grid, IconButton, Text, TextField } from "@radix-ui/themes"
import { decodeAta, getUserWsolAccount, isNativeMint, unwrapSol } from "gamba-core-v2"
import { useAccount, useGambaProvider, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import { TokenValue, useTokenMeta } from "gamba-react-ui-v2"
import React from "react"
import { mutate } from "swr"

import { Spinner } from "@/components/Spinner"
import { useBalance, useToast, formatTokenAmount } from "@/hooks"
import { UiPool } from "@/PoolList"

export function PoolWithdraw({ pool, jupiterTokens }: { pool: UiPool, jupiterTokens: any[] }) {
  const toast = useToast()
  const gamba = useGambaProvider()
  const user = useWalletAddress()
  const [loading, setLoading] = React.useState(false)
  const [amountText, setAmountText] = React.useState("")
  const token = useTokenMeta(pool.underlyingTokenMint)
  const balances = useBalance(pool.underlyingTokenMint)
  const sendTransaction = useSendTransaction()

  const jupiterToken = jupiterTokens.find(jt => jt.mint.equals(pool.underlyingTokenMint));
  const decimals = jupiterToken?.decimals ?? token?.decimals ?? 0;

  const amount = Math.round(Number(amountText) * (10 ** (jupiterToken?.decimals ?? 0)))

  const amountBigInt = BigInt(amount)
  const ratioBigInt = BigInt(Math.round(pool.ratio * (10 ** decimals)))
  const calculatedAmount = amountBigInt * BigInt(10 ** decimals) / ratioBigInt

  const withdraw = async () => {
    try {
      const { publicKey, state } = pool
      const underlyingTokenMint = state.underlyingTokenMint

      setLoading(true)

      const withdrawInstruction = gamba
        .withdrawFromPool(
          publicKey,
          underlyingTokenMint,
          amount,
        )

      const instructions = await (
        async () => {
          if (isNativeMint(state.underlyingTokenMint)) {
            const unwrapSolInstruction = await unwrapSol(user)
            return [withdrawInstruction, unwrapSolInstruction]
          }
          return [withdrawInstruction]
        }
      )()

      await sendTransaction(instructions, { confirmation: "confirmed" })

      mutate(`pool-${publicKey.toBase58()}`)

      toast({
        title: "🔥 Withdraw successful",
        description: "",
      })

      setAmountText("")
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Grid gap="2">
        <TextField.Root>
          <TextField.Input
            placeholder="Amount"
            value={amountText}
            size="3"
            onChange={event => setAmountText(event.target.value)}
            onFocus={event => event.target.select()}
          />
          <TextField.Slot>
            <IconButton onClick={() => setAmountText(String(.25 * balances.lpBalance / (10 ** token.decimals)))} variant="ghost">
              25%
            </IconButton>
            <IconButton onClick={() => setAmountText(String(.5 * balances.lpBalance / (10 ** token.decimals)))} variant="ghost">
              50%
            </IconButton>
            <IconButton onClick={() => setAmountText(String(balances.lpBalance / (10 ** token.decimals)))} variant="ghost">
              MAX
            </IconButton>
          </TextField.Slot>
        </TextField.Root>
        {/* <Flex justify="between">
          <Text size="2" color="gray">
            Balance
          </Text>
          <Text size="2">
            <TokenValue exact amount={balances.lpBalance} mint={token.mint} suffix="LP" />
          </Text>
        </Flex> */}
        <Flex justify="between">
          <Text size="2" color="gray">
            Receive
          </Text>
          <Text size="2">
            {/* <TokenValue exact amount={amount * pool.ratio} mint={pool.underlyingTokenMint} /> */}
            {formatTokenAmount(calculatedAmount, decimals)} {jupiterToken?.symbol}
          </Text>
        </Flex>
        <Button size="3" variant="soft" onClick={withdraw} disabled={loading || !amount}>
          Withdraw {loading && <Spinner $small />}
        </Button>
      </Grid>
    </div>
  )
}
