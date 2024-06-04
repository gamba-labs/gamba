import { Button, Flex, Grid, IconButton, Text, TextField } from "@radix-ui/themes"
import { isNativeMint, unwrapSol } from "gamba-core-v2"
import { useGambaProvider, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import BigDecimal from 'js-big-decimal'
import React from "react"
import { mutate } from "swr"

import { Spinner } from "@/components/Spinner"
import { TokenValue2 } from "@/components/TokenValue2"
import { useBalance, useToast } from "@/hooks"
import { useTokenMeta } from "@/hooks/useTokenMeta"
import { UiPool } from "@/views/Dashboard/PoolList"
import { stringtoBigIntUnits } from "./PoolDeposit"

export function PoolWithdraw({ pool }: { pool: UiPool }) {
  const toast = useToast()
  const gamba = useGambaProvider()
  const user = useWalletAddress()
  const [loading, setLoading] = React.useState(false)
  const [amountText, setAmountText] = React.useState("")
  const token = useTokenMeta(pool.underlyingTokenMint)
  const balances = useBalance(pool.underlyingTokenMint, pool.poolAuthority)
  const sendTransaction = useSendTransaction()

  // const amount = Math.round(Number(amountText) * (10 ** token.decimals))
  const amount = stringtoBigIntUnits(amountText, token.decimals)
  const receiveUnderlyingAmount = BigInt(new BigDecimal(amount).multiply(new BigDecimal(pool.ratio)).round().getValue())

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
        <Flex justify="between">
          <Text color="gray">
            Receive
          </Text>
          <Text>
            <TokenValue2
              exact
              amount={receiveUnderlyingAmount}
              mint={pool.underlyingTokenMint}
            />
          </Text>
        </Flex>
        <Flex justify="between">
          <Text color="gray">
            Value
          </Text>
          <Text>
            <TokenValue2
              dollar
              amount={receiveUnderlyingAmount}
              mint={pool.underlyingTokenMint}
            />
          </Text>
        </Flex>
        <Button size="3" variant="soft" onClick={withdraw} disabled={loading || !amount || amount > balances.lpBalance}>
          Withdraw {loading && <Spinner $small />}
        </Button>
      </Grid>
    </div>
  )
}
