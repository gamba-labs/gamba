import * as anchor from "@coral-xyz/anchor"
import { EnterIcon, ExclamationTriangleIcon, ExitIcon, MagicWandIcon, PlusIcon, StackIcon } from "@radix-ui/react-icons"
import * as Toast from "@radix-ui/react-toast"
import { Box, Button, Callout, Container, Flex, Link } from "@radix-ui/themes"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useTransactionError } from "gamba-react-v2"
import React from "react"
import { NavLink, Route, Routes, useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useToast, useToastStore } from "@/hooks"
import CreatePoolView from "@/views/CreatePool/CreatePoolView"
import DebugUserView from "@/views/Debug/DebugUser"
import DebugView from "@/views/Debug/DebugView"

import { PoolList } from "./PoolList"
import AllUsers from "./views/Debug/AllUsers"
import { PlatformView } from "./views/Platform/PlatformView"
import PlayView from "./views/Play/Play"
import { PlayerView } from "./views/Player/PlayerView"
import PoolConfigureView from "./views/Pool/PoolConfigView"
import PoolDepositView from "./views/Pool/PoolDeposit"
import PoolView from "./views/Pool/PoolView"
import PortfolioView from "./views/Portfolio/PortfolioView"

const Header = styled(Box)`
  background-color: var(--color-panel);
`

const Logo = styled(NavLink)`
  display: flex;
  justify-content: center;
  align-items: center;
  & > img {
    height: 35px;
  }
`

export function App() {
  const navigate = useNavigate()
  const toasts = useToastStore(state => state.toasts)
  const toast = useToast()
  const wallet = useWallet()
  const walletModal = useWalletModal()

  useTransactionError(err => {
    toast({
      title: "❌ Transaction Error",
      description: (() => {
        if (err instanceof anchor.AnchorError) {
          return err.error.errorMessage
        }
        return (err as any).message
      })(),
    })
  })

  return (
    <>
      <Header p="2" px="4">
        <Container>
          <Flex gap="2" align="center" justify="between">
            <Flex gap="4" align="center">
              <Logo to="/">
                <img alt="Logo" src="/logo.svg" />
              </Logo>
            </Flex>
            <Flex gap="2" align="center" style={{ position: "relative" }}>
              {/* <Button size="3" variant="soft" color="green" onClick={() => navigate("/create")}>
                Portfolio <BadgeIcon />
              </Button> */}
              {wallet.connected && (
                <>
                  <Button size="3" variant="soft" onClick={() => navigate("/debug")}>
                    Tools <MagicWandIcon />
                  </Button>
                  <Button size="3" variant="soft" onClick={() => navigate("/portfolio")}>
                    Portfolio <StackIcon />
                  </Button>
                </>
              )}
              <Button size="3" variant="soft" color="green" onClick={() => navigate("/create")}>
                Create Pool <PlusIcon />
              </Button>
              {!wallet.connected ? (
                <Button disabled={wallet.connecting} onClick={() => walletModal.setVisible(true)} size="3" variant="soft">
                  Connect <EnterIcon />
                </Button>
              ) : (
                <Button color="gray" onClick={() => wallet.disconnect()} size="3" variant="soft">
                  {wallet.publicKey?.toBase58().substring(0, 6)}...
                  <ExitIcon />
                </Button>
              )}
              {/* <WalletMultiButton /> */}
            </Flex>
          </Flex>
        </Container>
      </Header>

      <Container p="4">
        <Callout.Root color="red" mb="4">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>
            Gamba v2 is unaudited. Interact with the program at your own risk.
          </Callout.Text>
        </Callout.Root>
        <Toast.Viewport className="ToastViewport" />

        {toasts.map((toast, index) => (
          <Toast.Root className="ToastRoot" key={index}>
            <Toast.Title className="ToastTitle">
              {toast.title}
            </Toast.Title>
            <Toast.Description asChild>
              <div className="ToastDescription">
                {toast.description}
                <br />
                {toast.link && (
                  <Link href={toast.link} target="_blank">Link</Link>
                )}
              </div>
            </Toast.Description>
            <Toast.Action className="ToastAction" asChild altText="Goto schedule to undo">
              <Button variant="soft" size="1">
                Ok
              </Button>
            </Toast.Action>
          </Toast.Root>
        ))}

        <Routes>
          <Route
            path="/"
            element={<PoolList />}
          />
          <Route
            path="/debug"
            element={<DebugView />}
          />
          <Route
            path="/platform/:address"
            element={<PlatformView />}
          />
          <Route
            path="/player/:address"
            element={<PlayerView />}
          />
          <Route
            path="/users"
            element={<AllUsers />}
          />
          <Route
            path="/portfolio"
            element={<PortfolioView />}
          />
          <Route
            path="/user"
            element={<DebugUserView />}
          />
          <Route
            path="/tx/:txid"
            element={<PlayView />}
          />
          <Route
            path="/create"
            element={<CreatePoolView />}
          />
          <Route
            path="/pool/:poolId"
            element={<PoolView />}
          />
          <Route
            path="/pool/:poolId/deposit"
            element={<PoolDepositView />}
          />
          <Route
            path="/pool/:poolId/configure"
            element={<PoolConfigureView />}
          />
        </Routes>
      </Container>
    </>
  )
}
