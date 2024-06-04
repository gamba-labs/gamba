import { Button, Card, Dialog, Flex, Grid, Heading, IconButton, Text, TextField } from "@radix-ui/themes"
import { PublicKey } from "@solana/web3.js"
import { decodeAta, decodeGambaState, getGambaStateAddress, getUserWsolAccount, isNativeMint, wrapSol } from "gamba-core-v2"
import { useAccount, useGambaProgram, useGambaProvider, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import BigDecimal from 'js-big-decimal'
import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import useSWR, { mutate } from "swr"

import { Spinner } from "@/components/Spinner"
import { useBalance, useToast } from "@/hooks"
import { UiPool, fetchPool } from "@/views/Dashboard/PoolList"

import { TokenValue2 } from "@/components/TokenValue2"
import { useTokenMeta } from "@/hooks/useTokenMeta"
import { useWallet } from "@solana/wallet-adapter-react"
import { ConnectUserCard } from "../Debug/DebugUser"
import { PoolHeader } from "./PoolHeader"

export const stringtoBigIntUnits = (s: string, decimals: number) => {
  try {
    const ints = new BigDecimal(s).multiply(new BigDecimal(10 ** decimals)).round().getValue()
    return BigInt(ints)
  } catch {
    return BigInt(0)
  }
}

export function PoolDeposit({ pool }: {pool: UiPool}) {
  const navigate = useNavigate()
  const gamba = useGambaProvider()
  const user = useWalletAddress()
  const [loading, setLoading] = React.useState(false)
  const [amountText, setAmountText] = React.useState("")
  const token = useTokenMeta(pool.state.underlyingTokenMint)
  const balance = useBalance(pool.state.underlyingTokenMint)
  const sendTransaction = useSendTransaction()
  const toast = useToast()
  const wSolAccount = useAccount(getUserWsolAccount(user), decodeAta)
  const gambaState = useAccount(getGambaStateAddress(), decodeGambaState)
  const amount = stringtoBigIntUnits(amountText, token.decimals)
  const receiveLpAmount = BigInt(new BigDecimal(amount).divide(new BigDecimal(pool.ratio)).round().getValue())

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
          Add Liquidity
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
          <Text color="gray">
            Balance
          </Text>
          <Text>
            <TokenValue2 exact amount={balance.balance} mint={token.mint} />
          </Text>
        </Flex>
        <Flex justify="between">
          <Text color="gray">
            Value
          </Text>
          <Text>
            <TokenValue2
              dollar
              amount={receiveLpAmount}
              mint={pool.underlyingTokenMint}
            />
          </Text>
        </Flex>
        <Flex justify="between">
          <Text color="gray">
            Receive
          </Text>
          <Text>
            <TokenValue2
              exact
              amount={receiveLpAmount}
              mint={pool.underlyingTokenMint}
              suffix="LP"
            />
          </Text>
        </Flex>
        <Dialog.Root>
          <Dialog.Trigger>
            <Button disabled={loading} size="3" variant="soft">
              Deposit {loading && <Spinner $small />}
            </Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Flex direction="column" gap="4">
              <Heading>Warning!</Heading>
              <Text color="red">
                Gamba v2 is <strong>unaudited</strong>. The tokens you are about to deposit could vanish at any point in case of an undetected bug or exploit. We offer no refunds.
              </Text>
              <Text>
                The pool is also subject to volatility and you are at risk of losing money if the pool performs poorly.
              </Text>
              <Text>
                The play fee is currently <b>{(gambaState?.defaultPoolFee.toNumber() ?? 0) / 100}%</b>.
              </Text>
              <Dialog.Close>
                <Button size="3" variant="soft" onClick={deposit}>
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
