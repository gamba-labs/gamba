import { Button, Dialog, Flex, Grid, Heading, IconButton, Text, TextField } from "@radix-ui/themes"
import { createTransferInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { decodeAta, getPoolJackpotTokenAccountAddress, getUserWsolAccount, isNativeMint, wrapSol } from "gamba-core-v2"
import { useAccount, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import { TokenValue, useTokenMeta } from "gamba-react-ui-v2"
import React from "react"

import { useBalance, useToast } from "@/hooks"
import { UiPool } from "@/PoolList"

export function PoolJackpotDeposit({ pool }: { pool: UiPool }) {
  const [donateAmountText, setDonateAmountText] = React.useState("")
  const sendTransaction = useSendTransaction()
  const user = useWalletAddress()
  const toast = useToast()
  const token = useTokenMeta(pool.underlyingTokenMint)
  const balances = useBalance(pool.underlyingTokenMint)
  const wSolAccount = useAccount(getUserWsolAccount(user), decodeAta)

  const amount = Math.round(Number(donateAmountText) * (10 ** (token?.decimals ?? 0)))

  const donateToJackpot = async () => {
    const { publicKey, state } = pool
    const underlyingTokenMint = state.underlyingTokenMint
    const userAta = getAssociatedTokenAddressSync(underlyingTokenMint, user)
    const poolJackpotAddress = getPoolJackpotTokenAccountAddress(publicKey)

    const transferInstruction = createTransferInstruction(
      userAta,
      poolJackpotAddress,
      user,
      amount,
    )

    const instructions = isNativeMint(underlyingTokenMint) ? [...(await wrapSol(user, amount, !wSolAccount)), transferInstruction] : [transferInstruction]

    await sendTransaction(instructions, { confirmation: "confirmed" })

    toast({
      title: "Donation Successful",
      description: "You have successfully donated to the jackpot.",
    })
  }

  return (
    <Grid gap="2">
      <Heading>
        Fund Jackpot
      </Heading>
      <Text color="gray">
        Donate {token.symbol} to this pool's jackpot.
      </Text>
      <TextField.Root>
        <TextField.Input
          placeholder="Amount"
          value={donateAmountText}
          size="3"
          onFocus={e => e.target.select()}
          onChange={event => setDonateAmountText(event.target.value)}
        />
        <TextField.Slot>
          <IconButton onClick={() => setDonateAmountText(String(balances.balance / (10 ** token.decimals)))} size="1" variant="ghost">
            MAX
          </IconButton>
        </TextField.Slot>
      </TextField.Root>
      <Flex justify="between">
        <Text size="2" color="gray">
          Balance
        </Text>
        <Text size="2">
          <TokenValue exact amount={balances.balance} mint={pool.underlyingTokenMint} />
        </Text>
      </Flex>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button size="3" variant="soft">
            Donate
          </Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Grid gap="2">
            <Text>
              Donating to the Jackpot only serves to further incentivise players to play in the pool. You get nothing in return.
            </Text>
            <Text>
              It is not possible to withdraw the money.
            </Text>
            <Dialog.Close>
              <Button size="3" color="red" variant="soft" onClick={donateToJackpot}>
                Donate <TokenValue exact amount={amount} mint={pool.underlyingTokenMint} />
              </Button>
            </Dialog.Close>
          </Grid>
        </Dialog.Content>
      </Dialog.Root>
    </Grid>
  )
}
