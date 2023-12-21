import { TokenItem } from "@/components"
import { useTokenAccountsByOwner } from "@/hooks"
import { Button, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes"
import { NATIVE_MINT, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { PublicKey } from "@solana/web3.js"
import { decodeGambaState, getGambaStateAddress } from "gamba-core-v2"
import { useAccount, useGambaProgram, useSendTransaction } from "gamba-react-v2"
import React from "react"

function useTreasuryNativeBalance() {
  const userAccount = useAccount(getGambaStateAddress(), info => info)
  const nativeBalance = Number(userAccount?.lamports ?? 0)
  return nativeBalance
}

export default function Treasury() {
  const treasuryAddress = getGambaStateAddress()
  const solBalance = useTreasuryNativeBalance()
  const tokens = useTokenAccountsByOwner(treasuryAddress)
  const program = useGambaProgram()
  const sendTransaction = useSendTransaction()
  const gambaState = useAccount(treasuryAddress, decodeGambaState)

  const distributeFees = async (underlyingTokenMint: PublicKey, isNative = false) => {
    const gambaStateAtaAddress = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      treasuryAddress,
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
        gambaState: treasuryAddress,
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

  return (
    <Grid gap="4">
      <Flex justify="between">
        <Text>Treasury</Text>
        <Text>{treasuryAddress.toBase58()}</Text>
      </Flex>
      <Card>
        <Grid gap="4">
          <Heading>Treasury accounts</Heading>
          <Grid gap="2">
            {combinedTokens.map((token, i) => (
              <Card key={i}>
                <TokenItem
                  mint={token.mint}
                  balance={token.amount}
                  stuff={
                    <>
                      {token.isNative && '(Native)'}
                      <Button size="1" variant="ghost" onClick={() => distributeFees(
                        token.mint,
                        token.isNative,
                      )}>
                        Distribute
                      </Button>
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
