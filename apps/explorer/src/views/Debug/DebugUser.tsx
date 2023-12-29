import { Box, Button, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes"
import { PublicKey, TransactionInstruction } from "@solana/web3.js"
import { decodeGame, decodePlayer, getGameAddress, getPlayerAddress, getPlayerUnderlyingAta, getUserUnderlyingAta } from "gamba-core-v2"
import { useAccount, useGambaProgram, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import React from "react"
import { mutate } from "swr"

import { TokenItem } from "@/components"
import { SolanaAddress } from "@/components/SolanaAddress"
import { useTokenAccountsByOwner } from "@/hooks"

export default function DebugUserView() {
  const publicKey = useWalletAddress()
  const program = useGambaProgram()
  const playerAddress = getPlayerAddress(publicKey)
  const gameAddress = getGameAddress(publicKey)

  const player = useAccount(playerAddress, decodePlayer)
  const game = useAccount(gameAddress, decodeGame)

  const playerTokenList = useTokenAccountsByOwner(playerAddress)
  const sendTransaction = useSendTransaction()

  const initialize = async () => {
    sendTransaction(
      program.methods
        .playerInitialize()
        .accounts({})
        .instruction(),
    )
  }

  const close = async () => {
    sendTransaction(
      program.methods
        .playerClose()
        .accounts({ game: gameAddress })
        .instruction(),
    )
  }

  const claim = async (underlyingTokenMint: PublicKey) => {
    const playerAta = getPlayerUnderlyingAta(publicKey, underlyingTokenMint)
    const userUnderlyingAta = getUserUnderlyingAta(publicKey, underlyingTokenMint)
    await sendTransaction(
      [
        program.methods
          .playerClaim()
          .accounts({
            playerAta,
            underlyingTokenMint,
            userUnderlyingAta,
          })
          .instruction(),
      ],
      { confirmation: "confirmed" },
    )
    mutate("token-accounts-" + playerAddress)
  }

  const claimAll = async () => {
    const instructions = playerTokenList.map((token) => {
      if (!token.amount) return null
      const playerAta = getPlayerUnderlyingAta(publicKey, token.mint)
      const userUnderlyingAta = getUserUnderlyingAta(publicKey, token.mint)
      return program.methods
      .playerClaim()
        .accounts({
          playerAta,
          underlyingTokenMint: token.mint,
          userUnderlyingAta,
        })
        .instruction()
    }).filter((x) => !!x) as Promise<TransactionInstruction>[]

    if (instructions.length > 0) {
      await sendTransaction(instructions, { confirmation: "confirmed" })
      mutate("token-accounts-" + playerAddress)
    }
  }

  const isClaimable = playerTokenList.some(token => token.amount > 0)

  return (
    <Grid gap="4">
      <Flex justify="between">
        <Text>Player</Text>
        <SolanaAddress address={playerAddress} />
      </Flex>
      <Flex justify="between">
        <Text>Game</Text>
        <SolanaAddress address={gameAddress} />
      </Flex>
      <Card>
        <Grid gap="4">
          {playerTokenList.length > 0 && (
            <>
              <Box>
                <Heading>Player tokens accounts</Heading>
                <Text color="gray">
                  If you are stuck in a bet, you can claim back the tokens you used to play. Doing so will cancel your current bet and reset your account status.
                </Text>
              </Box>
              <Flex justify={"end"}>
                <Button size="2" onClick={claimAll} disabled={!isClaimable}>
                  Claim All
                </Button>
              </Flex>
              <Grid gap="2">
                {playerTokenList.map((token, i) => (
                  <Card key={i}>
                    <TokenItem
                      mint={token.mint}
                      balance={token.amount}
                      stuff={(
                        <Button disabled={token.amount === 0} size="2" variant="soft" onClick={() => claim(token.mint)}>
                          Claim
                        </Button>
                      )}
                    />
                  </Card>
                ))}
              </Grid>
            </>
          )}

          <Grid gap="4">
            {!player ? (
              <Button size="3" variant="soft" color="green" onClick={initialize}>
                Initialize
              </Button>
            ) : (
              <Button size="3" variant="soft" color="red" onClick={close}>
                Close Account
              </Button>
            )}
          </Grid>
        </Grid>
      </Card>

      <Card>
        <pre>
          {JSON.stringify(player, null, 2)}
        </pre>
      </Card>

      <Card>
        <pre>
          {JSON.stringify(game, null, 2)}
        </pre>
      </Card>
    </Grid>
  )
}
