import { Button, Card, Dialog, Flex, Heading } from "@radix-ui/themes"
import { useConnection, useLocalStorage } from "@solana/wallet-adapter-react"
import { decodeAta, decodeGambaState, getGambaStateAddress, getUserWsolAccount, unwrapSol } from "gamba-core-v2"
import { useAccount, useSendTransaction, useWalletAddress } from "gamba-react-v2"
import React, { PropsWithChildren } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { ConfigDialog } from "@/GambaConfig"
import { useToast } from "@/hooks"
import { useRpcThingy } from "@/index"
import MintDialogDevnet from "@/MintDialogDevnet"
import MintDialogLocalnet from "@/MintDialogLocalnet"

function ButtonWithDialog(props: PropsWithChildren & {label: string}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="soft">
          {props.label}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        {props.children}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default function DebugView() {
  const sendTx = useSendTransaction()
  const user = useWalletAddress()
  const { connection } = useConnection()
  const toast = useToast()
  const navigate = useNavigate()
  const wSolAccount = useAccount(getUserWsolAccount(user), decodeAta)

  const unwrap = async () => {
    await sendTx(unwrapSol(user))
    toast({ title: "Unwrapped", description: "Unwrapped WSOL" })
  }

  return (
    <Card style={{ maxWidth: "720px", margin: "0 auto" }} size="4">
      <Heading mb="4">
        Debug stuff
      </Heading>
      <Flex gap="2" direction="column">
        <Button variant="soft" onClick={() => navigate("/user")}>
          Debug User
        </Button>
        <Button variant="soft" onClick={() => navigate("/dao")}>
          DAO Tools
        </Button>
        <ButtonWithDialog label="Gamba Authority Config">
          <ConfigDialog />
        </ButtonWithDialog>
        {wSolAccount && (
          <Button variant="soft" onClick={unwrap}>
            Unwrap WSOL
          </Button>
        )}
        {window.location.origin.includes("localhost") && (
          <>
            {connection.rpcEndpoint.includes("http://127.0.0.1:8899") ? (
              <MintDialogLocalnet />
            ) : (
              <MintDialogDevnet />
            )}
          </>
        )}
      </Flex>
    </Card>
  )
}
