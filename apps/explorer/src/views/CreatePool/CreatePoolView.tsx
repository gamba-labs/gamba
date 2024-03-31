import { ArrowRightIcon, ExclamationTriangleIcon, PlusIcon } from "@radix-ui/react-icons"
import { Avatar, Button, Callout, Card, Dialog, Flex, Grid, Heading, Link, ScrollArea, Switch, Text, TextField } from "@radix-ui/themes"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { ComputeBudgetProgram } from "@solana/web3.js"
import { NATIVE_MINT, decodeGambaState, getGambaStateAddress, getPoolAddress, isNativeMint } from "gamba-core-v2"
import { useAccount, useGambaProvider, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import React from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"

import { SelectableButton, TokenAvatar } from "@/components"
import { truncateString } from "@/components/AccountItem"
import { TokenValue2 } from "@/components/TokenValue2"
import { SYSTEM_PROGRAM } from "@/constants"
import { ParsedTokenAccount, useTokenList } from "@/hooks"
import { useGetTokenMeta, useTokenMeta } from "@/hooks/useTokenMeta"
import { fetchPool } from "@/views/Dashboard/PoolList"
import { ConnectUserCard } from "../Debug/DebugUser"

function SelectableToken(props: {token: ParsedTokenAccount, selected: boolean, onSelect: () => void}) {
  const meta = useTokenMeta(props.token.mint)
  return (
    <SelectableButton
      selected={props.selected}
      onClick={props.onSelect}
    >
      <Flex justify="between">
        <Flex gap="4" align="center">
          <TokenAvatar mint={props.token.mint} />
          <Flex direction="column">
            <Text>{meta.name}</Text>
            <Text>{meta.symbol ?? truncateString(props.token.mint.toString())}</Text>
          </Flex>
        </Flex>
        <Flex direction="column" align="end" justify="end">
          <Text>
            <TokenValue2 mint={props.token.mint} amount={props.token.amount} />
          </Text>
          <Text color="gray">
            <TokenValue2 dollar mint={props.token.mint} amount={props.token.amount} />
          </Text>
        </Flex>
      </Flex>
      {/* <TokenItem mint={props.token.mint} balance={props.token.amount} /> */}
    </SelectableButton>
  )
}

function PublicPoolWarning({token}: {token: ParsedTokenAccount}) {
  const selectedTokenMeta = useTokenMeta(token.mint ?? NATIVE_MINT)
  const gambaState = useAccount(getGambaStateAddress(), decodeGambaState)

  return (
    <>
      <Text>
        You are about to create a public liqudity pool for <Avatar src={selectedTokenMeta.image} fallback="?" size="1" radius="full" /><b>{selectedTokenMeta.name} ({selectedTokenMeta.symbol})</b>.
      </Text>
      <Text>
        Since it's public, anyone will be able make deposits to it, and any frontend will be able to make use of its liquidity for plays.
      </Text>
      <Text>
        The cost of creating a pool is <b><TokenValue2 mint={NATIVE_MINT} amount={gambaState?.poolCreationFee ?? 0} /></b> + rent.
      </Text>
      <Text>
        The play fee is currently <b>{(gambaState?.defaultPoolFee.toNumber() ?? 0) / 100}%</b>.
      </Text>
    </>
  )
}

function PrivatePoolWarning({token}: {token: ParsedTokenAccount}) {
  const selectedTokenMeta = useTokenMeta(token.mint ?? NATIVE_MINT)
  const gambaState = useAccount(getGambaStateAddress(), decodeGambaState)

  return (
    <>
      <Text>
        You are about to create a private liqudity pool for <Avatar src={selectedTokenMeta.image} fallback="?" size="1" radius="full" /><b>{selectedTokenMeta.name} ({selectedTokenMeta.symbol})</b>.
      </Text>
      <Text>
        Please read up on private pools before creating.
      </Text>
      <Text>
        The cost of creating a pool is <b><TokenValue2 mint={NATIVE_MINT} amount={gambaState?.poolCreationFee ?? 0} /></b> + rent.
      </Text>
    </>
  )
}

function Inner() {
  const navigate = useNavigate()
  const { connection } = useConnection()
  const publicKey = useWalletAddress()
  const gamba = useGambaProvider()
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
          const balanceDiff = b.amount - a.amount
          if (balanceDiff) return balanceDiff
          return a.mint.toBase58() > b.mint.toBase58() ? 1 : -1
        })
    },
    [tokens],
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

      const slot = await connection.getSlot()

      const tx = await sendTx(
        gamba.createPool(selectedToken.mint, authority, slot),
        { confirmation: "confirmed", priorityFee: 201_000, computeUnitLimitMargin: 1.25 },
      )

      console.log("Create pool txId", tx)

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
              size="3"
              onChange={(evt) => setSearch(evt.target.value)}
            />
          </TextField.Root>
          <ScrollArea style={{ maxHeight: "300px" }}>
            <Grid gap="1">
              {filteredTokens.map((token, i) => (
                <SelectableToken
                  key={i}
                  token={token}
                  onSelect={() => setSelectedToken(token)}
                  selected={!!selectedToken?.mint.equals(token.mint)}
                />
              ))}
            </Grid>
          </ScrollArea>
          <Flex align="center" justify="between">
            <Text>
              Private
            </Text>
            <Switch
              radius="full"
              checked={isPrivate}
              onCheckedChange={value => setPrivate(value)}
            />
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
              <Flex direction="column" gap="2">
                <Heading>Read before creating!</Heading>
                {selectedToken && (
                  <>
                    {!isPrivate && <PublicPoolWarning token={selectedToken} />}
                    {isPrivate && <PrivatePoolWarning token={selectedToken} />}
                  </>
                )}
                <Button size="3" variant="soft" color="green" onClick={createPool}>
                  Create Pool
                </Button>
              </Flex>
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
