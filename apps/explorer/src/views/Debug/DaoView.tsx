import { ConfigDialog } from "@/GambaConfig"
import { DailyVolume, useApi } from "@/api"
import { LineChart, LineChartDataPoint } from "@/charts/LineChart"
import { TokenItem } from "@/components"
import { Details } from "@/components/Details"
import { SolanaAddress } from "@/components/SolanaAddress"
import { TokenValue2 } from "@/components/TokenValue2"
import { useGetTokenMeta, useTokenAccountsByOwner } from "@/hooks"
import { GearIcon } from "@radix-ui/react-icons"
import { Button, Card, Dialog, Flex, Grid, Text } from "@radix-ui/themes"
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

function TotalVolume() {
  const { data: daily = [] } = useApi<DailyVolume[]>(
    "/chart/dao-usd",
  )
  const [hovered, setHovered] = React.useState<LineChartDataPoint | null>(null)

  const cumsum = React.useMemo(
    () => daily.reduce<LineChartDataPoint[]>((p, x, i, arr) => {
      const prev_volume = i === 0 ? 0 : p[i - 1].value
      return [
        ...p,
        {value: x.total_volume, date: x.date}
      ]
    }, [] as LineChartDataPoint[]),
    [daily]
  )

  const total2 = React.useMemo(
    () => cumsum.reduce((x, p) => x + p.value, 0) / cumsum.length,
    [cumsum]
  )

  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <Text color="gray">
          {hovered?.date ? new Date(hovered.date).toLocaleString(undefined, {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Daily fees'}
        </Text>
        <Text size="7" weight="bold">
          ~${(hovered?.value ?? total2).toLocaleString(undefined, {maximumFractionDigits: 1})}
        </Text>
      </Flex>
      <div style={{height: '200px'}}>
        <LineChart
          chart={{data: cumsum}}
          onHover={setHovered}
          lineColor="#33ff66"
        />
      </div>
    </Card>
  )
}

export default function DaoView() {
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

  const sortedTokens = React.useMemo(
    () =>
      [...tokens].sort((a, b) => {
        const aMeta = getTokenMeta(a.mint)
        const bMeta = getTokenMeta(b.mint)
        const aValue = aMeta.usdPrice * a.amount / (10 ** a.decimals)
        const bValue = bMeta.usdPrice * b.amount / (10 ** b.decimals)
        return bValue - aValue
      }),
    [tokens, getTokenMeta]
  )

  const combinedTokens = [
    // Always include Native SOL (Not WSOL)
    { mint: NATIVE_MINT, amount: solBalance, isNative: true },
    ...sortedTokens,
  ] as {mint: PublicKey, amount: number, isNative: true | undefined}[]

  const total = combinedTokens.reduce(
    (p, x) => {
      const meta = getTokenMeta(x.mint)
      return p + meta.usdPrice * (x.amount / (10 ** meta.decimals))
    },
    0
  )

  return (
      <Grid
        gap="4"
        columns={{initial: '1', sm: '1', md: '2'}}
      >
      <Flex gap="4" direction="column">
        <TotalVolume />
        <Details
          title="Details"
          rows={[
            ["DAO Address", <SolanaAddress address={daoAddress} />],
            [
              "Balance",
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
        {/* <Card>
          <ConfigDialog />
        </Card> */}
      </Flex>
      <Card>
        <Flex direction="column" gap="4">
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
        </Flex>
      </Card>
    </Grid>
  )
}
