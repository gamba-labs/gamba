import { ArrowRightIcon, ExclamationTriangleIcon, PlusIcon } from "@radix-ui/react-icons"
import { Button, Callout, Card, Dialog, Flex, Grid, Heading, Link, ScrollArea, Switch, Text, TextField } from "@radix-ui/themes"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { ComputeBudgetProgram } from "@solana/web3.js"
import { NATIVE_MINT, decodeGambaState, getGambaStateAddress, getPoolAddress, isNativeMint } from "gamba-core-v2"
import { useAccount, useGambaProvider, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import React from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"

import { SelectableButton, TokenItem } from "@/components"
import { SYSTEM_PROGRAM } from "@/constants"
import { ParsedTokenAccount, useTokenList } from "@/hooks"
import { useGetTokenMeta } from "@/hooks/useTokenMeta"
import { fetchPool } from "@/views/Dashboard/PoolList"
import { ConnectUserCard } from "../Debug/DebugUser"
import { TokenValue2 } from "@/components/TokenValue2"

function Inner() {
  const navigate = useNavigate()
  const { connection } = useConnection()
  const publicKey = useWalletAddress()
  const gamba = useGambaProvider()
  const jupiterList: any = {} // useJupiterList()
  const gambaState = useAccount(getGambaStateAddress(), decodeGambaState)
  const [selectedToken, setSelectedToken] = React.useState<ParsedTokenAccount>()
  const tokens = useTokenList()
  const sendTx = useSendTransaction()
  const [isPrivate, setPrivate] = React.useState(false)
  const authority = isPrivate ? publicKey : SYSTEM_PROGRAM
  const selectedPoolId = selectedToken && getPoolAddress(selectedToken.mint, authority)
  const { data: selectedPool, isLoading } = useSWR(
    () => selectedPoolId && "pool-" + selectedPoolId.toBase58(),
    () => selectedPoolId && fetchPool(connection, selectedPoolId),
  )

  const [search, setSearch] = React.useState("")

  // Sort by 1. Sol, 2. Known tokens 3. Balance 4. Pubkey
  const sortedTokens = React.useMemo(
    () => {
      return tokens
        .sort((a, b) => {
          const nativeMintDiff = Number(isNativeMint(b.mint)) - Number(isNativeMint(a.mint))
          if (nativeMintDiff) return nativeMintDiff
          const aKnown = !!jupiterList[a.mint.toString()]
          const bKnown = !!jupiterList[b.mint.toString()]
          const knownDiff = Number(bKnown) - Number(aKnown)
          if (knownDiff) return knownDiff
          const balanceDiff = b.amount - a.amount
          if (balanceDiff) return balanceDiff
          return a.mint.toBase58() > b.mint.toBase58() ? 1 : -1
        })
    },
    [tokens, jupiterList],
  )

  const getTokenMeta = useGetTokenMeta()

  const filteredTokens = React.useMemo(
    () =>
      sortedTokens.filter((x) => {
        const meta = getTokenMeta(x.mint)
        if (x.mint.toBase58().toLocaleLowerCase().includes(search.toLowerCase())) return true
        if (meta.symbol?.toLowerCase().includes(search.toLowerCase())) return true
        if (meta.name?.toLowerCase().includes(search.toLowerCase())) return true
        return false
      }),
    [getTokenMeta, sortedTokens, search]
  )

  const createPool = async () => {
    try {
      if (!selectedToken) return

      const pool = getPoolAddress(selectedToken.mint, authority)

      const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 })
      const slot = await connection.getSlot()

      const combinedInstructions = [
        modifyComputeUnits,
        ...gamba.createPool(selectedToken.mint, authority, slot),
        // gamba.createPoolLocalnet(selectedToken.mint, authority),
      ]

      await sendTx(
        combinedInstructions,
        { confirmation: "confirmed" },
      )

      navigate("/pool/" + pool.toBase58() + "")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <Card style={{ maxWidth: "720px", margin: "0 auto" }} size="4">
        <Flex direction="column" gap="4">
          <Heading>
            Select Token
          </Heading>
          {gambaState && !gambaState.poolCreationAllowed && (
            <Callout.Root color="orange">
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>
              <Callout.Text>Pool Creation is restricted at the moment. Come back later or select a pool that has already been created.</Callout.Text>
            </Callout.Root>
          )}
          <Text size="2" color="gray">
            Select the token you want to provide liqudity for
          </Text>
          <TextField.Root>
            <TextField.Input
              placeholder="Filter Tokens"
              value={search}
              onChange={(evt) => setSearch(evt.target.value)}
            />
          </TextField.Root>
          <ScrollArea style={{ maxHeight: "300px" }}>
            <Grid gap="1">
              {filteredTokens.map((token, i) => (
                <div key={i}>
                  <SelectableButton
                    selected={selectedToken?.mint.equals(token.mint)}
                    onClick={() => setSelectedToken(token)}
                  >
                    <TokenItem mint={token.mint} balance={token.amount} />
                  </SelectableButton>
                </div>
              ))}
            </Grid>
          </ScrollArea>
          <Flex align="center" justify="between">
            <Text>
              Private
            </Text>
            <Switch disabled radius="full" checked={isPrivate} onCheckedChange={value => setPrivate(value)} />
          </Flex>
          <Dialog.Root>
            <Dialog.Trigger>
              <Button
                size="3"
                color="green"
                variant="soft"
                disabled={!selectedToken || isLoading || !gambaState?.poolCreationAllowed || !!selectedPool}
              >
                Create Pool <PlusIcon />
              </Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Grid gap="2">
                {isPrivate && (
                  <Text>
                    You are about to create a private pool. Please read before doing so.
                  </Text>
                )}
                {!isPrivate && (
                  <Text>
                    You are about to create a public pool. Please read before doing so.
                  </Text>
                )}
                <Callout.Root color="blue">
                  <Callout.Icon>
                    <ExclamationTriangleIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    Note: Creating a pool requires a fee of <TokenValue2 mint={NATIVE_MINT} amount={gambaState?.poolCreationFee ?? 0} />.
                  </Callout.Text>
                </Callout.Root>
                <Button variant="soft" color="red" onClick={createPool}>
                  I know what I'm doing. Create
                </Button>
              </Grid>
            </Dialog.Content>
          </Dialog.Root>
          {!isLoading && !!selectedPool && (
            <Link
              onClick={() => navigate("/pool/" + selectedPool.publicKey.toBase58())}
            >
              This pool already exists. Go to deposit <ArrowRightIcon />
            </Link>
          )}
        </Flex>
      </Card>
    </>
  )
}

export default function CreatePoolView() {
  const wallet = useWallet()
  return wallet.connected ? <Inner /> : <ConnectUserCard />
}
