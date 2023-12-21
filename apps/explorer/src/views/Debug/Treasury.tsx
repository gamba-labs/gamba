import { Card, Grid, Text, Flex, Heading, Box, Button } from "@radix-ui/themes"
import React, { useEffect } from "react"
import { decodeGambaState, getGambaStateAddress } from "gamba-core"
import { TokenItem } from "@/components"
import { useTokenAccountsByOwner } from "@/hooks"
import { useAccount, useGambaProgram, useSendTransaction } from "gamba-react"
import { PublicKey, SystemProgram } from "@solana/web3.js"
import { getAssociatedTokenAddressSync } from "@solana/spl-token"

export default function Treasury() {
  const [solBalance, setSolBalance] = React.useState(0)
  const treasuryAddress = getGambaStateAddress()
  const tokens = useTokenAccountsByOwner(treasuryAddress)
  const program = useGambaProgram()
  const sendTransaction = useSendTransaction()
  const gambastate = useAccount(getGambaStateAddress(), decodeGambaState)
  const connection = useGambaProgram().provider.connection

  useEffect(() => {
    const fetchSolBalance = async () => {
      const balance = await connection.getBalance(new PublicKey(treasuryAddress))
      setSolBalance(balance / Math.pow(10, 9))
    }

    fetchSolBalance()
  }, [treasuryAddress, connection])

  const distributeFees = async (underlyingTokenMint: PublicKey, isNative: boolean) => {
    const effectiveMint = isNative ? new PublicKey("So11111111111111111111111111111111111111112") : underlyingTokenMint //if native sol shove in placeholder address so method passes

    const gambaStateAtaAddress = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      treasuryAddress,
      true,
    )

    const distributionRecipient = gambastate.distributionRecipient
    const distributionRecipientAta = getAssociatedTokenAddressSync(
      underlyingTokenMint,
      distributionRecipient,
      true,
    )

    const IX = program.methods
      .distributeFees(isNative)
      .accounts({
        gambaState: getGambaStateAddress(),
        underlyingTokenMint: effectiveMint,
        gambaStateAta: gambaStateAtaAddress,
        distributionRecipient: distributionRecipient,
        distributionRecipientAta: distributionRecipientAta,

      })
      .instruction()

    await sendTransaction([IX], { confirmation: "confirmed" })
  }

  const combinedTokens = [{ mint: null, amount: solBalance }, ...tokens]

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
                <Flex justify="between" >
                  {token.mint ? (
                    <TokenItem
                      mint={token.mint}
                      balance={token.amount}
                    />
                  ) : (
                    <Text>Native SOL: {token.amount.toFixed(4)} SOL</Text>
                  )}
                  <Button onClick={() => distributeFees(
                    token.mint === null ? new PublicKey("So11111111111111111111111111111111111111112") : token.mint,
                    token.mint === null,
                  )}>
                    Distribute
                  </Button>
                </Flex>
              </Card>
            ))}
          </Grid>
        </Grid>
      </Card>
    </Grid>
  )
}
