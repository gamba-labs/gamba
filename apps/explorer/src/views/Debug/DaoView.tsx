import { TokenAvatar, TokenItem } from "@/components"
import { SolanaAddress } from "@/components/SolanaAddress"
import { TokenValue2 } from "@/components/TokenValue2"
import { useTokenAccountsByOwner } from "@/hooks"
import { Button, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes"
import { NATIVE_MINT, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { PublicKey } from "@solana/web3.js"
import { decodeGambaState, getGambaStateAddress } from "gamba-core-v2"
import { useAccount, useGambaProgram, useSendTransaction } from "gamba-react-v2"
import React from "react"

function useDaoNativeBalance() {
  const userAccount = useAccount(getGambaStateAddress(), info => info)
  const nativeBalance = Number(userAccount?.lamports ?? 0)
  return nativeBalance
}

export default function DaoView() {
  const daoAddress = getGambaStateAddress()
  const solBalance = useDaoNativeBalance()
  const tokens = useTokenAccountsByOwner(daoAddress)
  const program = useGambaProgram()
  const sendTransaction = useSendTransaction()
  const gambaState = useAccount(daoAddress, decodeGambaState)

  const distributeFees = async (underlyingTokenMint: PublicKey, isNative = false) => {
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

  return (
    <Grid gap="4">
      <Flex justify="between">
        <Text>DAO</Text>
        <SolanaAddress address={daoAddress} />
      </Flex>
      <Card>
        <Grid gap="4">
          <Heading>Token accounts</Heading>
          <Grid gap="2">
            {combinedTokens.map((token, i) => (
              <Card key={i}>
                <TokenItem
                  mint={token.mint}
                  balance={token.amount}
                  stuff={
                    <>
                      <TokenValue2 dollar mint={token.mint} amount={token.amount} />
                      {token.isNative && '(Native)'}
                      <Button size="2" variant="soft" onClick={() => distributeFees(
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
