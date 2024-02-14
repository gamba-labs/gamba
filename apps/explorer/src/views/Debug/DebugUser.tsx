import { Box, Button, Card, Flex, Grid, Heading, Link, Text } from "@radix-ui/themes"
import { PublicKey, TransactionInstruction } from "@solana/web3.js"
import { decodeGame, decodePlayer, getGameAddress, getPlayerAddress, getPlayerUnderlyingAta, getUserUnderlyingAta } from "gamba-core-v2"
import { useAccount, useGambaProgram, useGambaProvider, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import React from "react"
import { mutate } from "swr"

import { TokenItem } from "@/components"
import { PlayerAccountItem } from "@/components/AccountItem"
import { Details } from "@/components/Details"
import { SolanaAddress } from "@/components/SolanaAddress"
import { useTokenAccountsByOwner } from "@/hooks"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { EnterIcon } from "@radix-ui/react-icons"

export function ConnectUserCard() {
  const wallet = useWallet()
  const walletModal = useWalletModal()
  return (
    <Card size="3">
      <Grid gap="4" align="center" justify="center">
        <Heading align="center">
          Not Connected
        </Heading>
        <Text align="center" color="gray">
          Connect your wallet to continue.
        </Text>
        <Flex align="center" justify="center">
          <Button disabled={wallet.connecting} onClick={() => walletModal.setVisible(true)} size="3" variant="soft">
            Connect <EnterIcon />
          </Button>
        </Flex>
      </Grid>
    </Card>
  )
}

function Inner() {
  const publicKey = useWalletAddress()
  const program = useGambaProgram()
  const playerAddress = getPlayerAddress(publicKey)
  const gameAddress = getGameAddress(publicKey)

  const player = useAccount(playerAddress, decodePlayer)
  const game = useAccount(gameAddress, decodeGame)

  const playerTokenList = useTokenAccountsByOwner(playerAddress)
  const sendTransaction = useSendTransaction()
  const [initializing, setInitializing] = React.useState(false)
  const [closing, setClosing] = React.useState(false)

  const initialize = async () => {
    setInitializing(true)
    try {
      await sendTransaction(
        program.methods
          .playerInitialize()
          .accounts({})
          .instruction(),
        {confirmation: "confirmed"}
      )
    } finally {
      setInitializing(false)
    }
  }

  const close = async () => {
    setClosing(true)
    try {
      await sendTransaction(
        program.methods
          .playerClose()
          .accounts({ game: gameAddress })
          .instruction(),
        {confirmation: "confirmed"}
      )
    } finally {
      setClosing(false)
    }
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
    <Flex direction="column" gap="4">
      <Flex direction="column" gap="4">
        <Details
          title={<PlayerAccountItem address={publicKey} />}
          rows={[
            [
              "Wallet address",
              <SolanaAddress address={publicKey} />
            ],
            [
              "Player address",
              <SolanaAddress address={playerAddress} />
            ],
            [
              "Game address",
              <SolanaAddress address={gameAddress} />
            ],
          ]}
        />
      </Flex>
      <Card>
        <Grid gap="4">
          {playerTokenList.length > 0 && (
            <>
              <Box>
                <Text color="gray" size="2">
                  If you are stuck in a bet, you can claim back the tokens you used to play.
                  Doing so will cancel your current bet and reset your account status.
                </Text>
                <br />
                <Text color="red" size="2">
                  Please report any issues you find to us on <Link target="_blank" href="https://discord.gg/xjBsW3e8fK">Discord</Link>!
                </Text>
              </Box>
              {/* <Flex justify={"end"}>
                <Button size="2" onClick={claimAll} disabled={!isClaimable}>
                  Claim All
                </Button>
              </Flex> */}
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
              <Button disabled={initializing} size="3" variant="soft" color="green" onClick={initialize}>
                Initialize
              </Button>
            ) : (
              <>
                <Button size="3" variant="soft" color="red" onClick={close} disabled={closing || isClaimable}>
                  Close account
                </Button>
                {isClaimable && (
                  <Text size="2" color="gray">
                    Claim all your tokens before closing your account.
                  </Text>
                )}
              </>
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
    </Flex>
  )
}

export default function DebugUserView() {
  const wallet = useWallet()

  if (!wallet.connected) {
    return <ConnectUserCard />
  }

  return (
    <Inner />
  )
}
