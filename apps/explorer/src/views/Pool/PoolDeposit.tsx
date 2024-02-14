import { Button, Card, Dialog, Flex, Grid, Heading, IconButton, Text, TextField } from "@radix-ui/themes"
import { PublicKey } from "@solana/web3.js"
import { decodeAta, getUserWsolAccount, isNativeMint, wrapSol } from "gamba-core-v2"
import { useAccount, useGambaProgram, useGambaProvider, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import useSWR, { mutate } from "swr"

import { Spinner } from "@/components/Spinner"
import { useBalance, useToast } from "@/hooks"
import { UiPool, fetchPool } from "@/views/Dashboard/PoolList"

import { TokenValue2 } from "@/components/TokenValue2"
import { useTokenMeta } from "@/hooks/useTokenMeta"
import { PoolHeader } from "./PoolView"
import { useWallet } from "@solana/wallet-adapter-react"
import { ConnectUserCard } from "../Debug/DebugUser"

export function PoolDeposit({ pool }: {pool: UiPool}) {
  const navigate = useNavigate()
  const wallet = useWallet()
  const gamba = useGambaProvider()
  const user = useWalletAddress()
  const [loading, setLoading] = React.useState(false)
  const [amountText, setAmountText] = React.useState("")
  const token = useTokenMeta(pool.state.underlyingTokenMint)
  const balance = useBalance(pool.state.underlyingTokenMint)
  const sendTransaction = useSendTransaction()
  const toast = useToast()
  const wSolAccount = useAccount(getUserWsolAccount(user), decodeAta)

  const amount = Math.round(Number(amountText) * (10 ** token.decimals))

  const deposit = async () => {
    try {
      const { publicKey, state } = pool

      setLoading(true)

      const depositInstruction = gamba.depositToPool(
        publicKey,
        state.underlyingTokenMint,
        amount,
      )

      const instructions = await (
        async () => {
          if (isNativeMint(state.underlyingTokenMint)) {
            const wrapSolInstructions = await wrapSol(
              user,
              amount,
              !wSolAccount,
            )
            return [...wrapSolInstructions, depositInstruction]
          }
          return [depositInstruction]
        }
      )()

      await sendTransaction(instructions, { confirmation: "confirmed" })

      mutate(`pool-${publicKey.toBase58()}`)

      navigate("/pool/" + pool.publicKey.toBase58())
      toast({
        title: "🫡 Deposited to pool",
        description: "Deposit successful",
      })
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Grid gap="2">
        <Heading>
          Add Liqudity
        </Heading>
        <TextField.Root>
          <TextField.Input
            placeholder="Amount"
            value={amountText}
            size="3"
            onChange={event => setAmountText(event.target.value)}
            onFocus={event => event.target.focus()}
          />
          <TextField.Slot>
            <IconButton onClick={() => setAmountText(String(balance.balance / (10 ** token.decimals)))} size="1" variant="ghost">
              MAX
            </IconButton>
          </TextField.Slot>
        </TextField.Root>
        <Flex justify="between">
          <Text size="2" color="gray">
            Balance
          </Text>
          <Text size="2">
            <TokenValue2 exact amount={balance.balance} mint={token.mint} />
          </Text>
        </Flex>
        <Flex justify="between">
          <Text size="2" color="gray">
            Receive
          </Text>
          <Text size="2">
            <TokenValue2 exact amount={amount / pool.ratio} mint={pool.underlyingTokenMint} suffix="LP" />
          </Text>
        </Flex>
        <Dialog.Root>
          <Dialog.Trigger>
            <Button disabled={loading || !amount} size="3" variant="soft">
              Deposit {loading && <Spinner $small />}
            </Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Flex direction="column" gap="4">
              <Heading>Warning!</Heading>
              <Text>
                Gamba v2 is <strong>unaudited</strong>. The tokens you are about to deposit could vanish at any point in case of an undetected bug or exploit. We offer no refunds.
              </Text>
              <Text>
                The pool is also subject to volatility and you are at risk of losing money if the pool performs poorly.
              </Text>
              <Dialog.Close>
                <Button variant="soft" color="red" onClick={deposit}>
                  I know what I'm doing. Deposit
                </Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Grid>
    </>
  )
}

export default function PoolDepositView() {
  const program = useGambaProgram()
  const params = useParams<{poolId: string}>()
  const poolId = React.useMemo(() => new PublicKey(params.poolId!), [params.poolId])
  const { data } = useSWR("pool-" + params.poolId!, () => fetchPool(program.provider.connection, poolId))
  const wallet = useWallet()
  return (
    <>
      {data && (
        <Grid gap="4">
          <Flex justify="between" align="end" py="4">
            <PoolHeader pool={data} />
          </Flex>
          {wallet.connected ? (
            <Card size="3">
              <PoolDeposit pool={data} />
            </Card>
          ) : (
            <ConnectUserCard />
          )}
        </Grid>
      )}
    </>
  )
}
