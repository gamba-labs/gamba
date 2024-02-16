import { ConfigDialog } from "@/GambaConfig"
import { TokenItem } from "@/components"
import { Details } from "@/components/Details"
import { SolanaAddress } from "@/components/SolanaAddress"
import { TokenValue2 } from "@/components/TokenValue2"
import { useGetTokenMeta, useGetTokenPrice, useTokenAccountsByOwner } from "@/hooks"
import { GearIcon } from "@radix-ui/react-icons"
import { Button, Card, Dialog, Grid, Text } from "@radix-ui/themes"
import { NATIVE_MINT, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { PublicKey } from "@solana/web3.js"
import { decodeGambaState, getGambaStateAddress } from "gamba-core-v2"
import { useAccount, useGambaProgram, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import React from "react"

function useDaoNativeBalance() {
  const userAccount = useAccount(getGambaStateAddress(), info => info)
  const nativeBalance = Number(userAccount?.lamports ?? 0)
  return nativeBalance
}

function ButtonWithDialog(props: React.PropsWithChildren & {label: React.ReactNode}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button size="3" variant="soft">
          {props.label}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        {props.children}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default function DaoView() {
  const getTokenPrice = useGetTokenPrice()
  const getTokenMeta = useGetTokenMeta()
  const daoAddress = getGambaStateAddress()
  const solBalance = useDaoNativeBalance()
  const tokens = useTokenAccountsByOwner(daoAddress)
  const program = useGambaProgram()
  const sendTransaction = useSendTransaction()
  const gambaState = useAccount(daoAddress, decodeGambaState)
  const userPublicKey = useWalletAddress()
  const isGambaStateAuthority = userPublicKey && gambaState?.authority?.equals(userPublicKey)
  const distributeFees = async (underlyingTokenMint: PublicKey, isNative = false) => {
    if (!gambaState) return

    const gambaStateAtaAddress = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      daoAddress,
      true,
    )

    const distributionRecipient = gambaState.distributionRecipient
    const distributionRecipientAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      distributionRecipient,
      true,
    )

    const instruction = program.methods
      .distributeFees(isNative)
      .accounts({
        gambaState: daoAddress,
        underlyingTokenMint,
        gambaStateAta: gambaStateAtaAddress,
        distributionRecipient: distributionRecipient,
        distributionRecipientAta: distributionRecipientAta,

      })
      .instruction()

    await sendTransaction([instruction], { confirmation: "confirmed" })
  }

  const combinedTokens = [
    // Always include Native SOL (Not WSOL)
    { mint: NATIVE_MINT, amount: solBalance, isNative: true },
    ...tokens,
  ] as {mint: PublicKey, amount: number, isNative: true | undefined}[]


  const total = combinedTokens.reduce(
    (p, x) => p + getTokenPrice(x.mint) * (x.amount / (10 ** getTokenMeta(x.mint).decimals)),
    0
  )

  return (
    <Grid gap="4">
      <Details
        title="DAO"
        rows={[
          ["DAO Address", <SolanaAddress address={daoAddress} />],
          [
            "Accumulated fees",
            <Text>
              ${total.toLocaleString(undefined, {maximumFractionDigits: 1})}
            </Text>
          ],
        ]}
      />
      {isGambaStateAuthority && (
        <ButtonWithDialog label={<>Config <GearIcon /></>}>
          <ConfigDialog />
        </ButtonWithDialog>
      )}
      <Card>
        <Grid gap="4">
          <Grid gap="2">
            {combinedTokens.map((token, i) => (
              <Card key={i}>
                <TokenItem
                  mint={token.mint}
                  balance={token.amount}
                  stuff={
                    <>
                      {token.isNative && '(Native) '}
                      <TokenValue2 dollar mint={token.mint} amount={token.amount} />
                      {isGambaStateAuthority && (
                        <Button size="2" variant="soft" onClick={() => distributeFees(
                          token.mint,
                          token.isNative,
                        )}>
                          Distribute
                        </Button>
                      )}
                    </>
                  }
                />
              </Card>
            ))}
          </Grid>
        </Grid>
      </Card>
    </Grid>
  )
}
