import { Cross1Icon, EnterIcon, ExitIcon } from "@radix-ui/react-icons"
import { Box, Button, Flex } from "@radix-ui/themes"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import styled, { css } from "styled-components"

const StyledSidebar = styled.div<{$open: boolean}>`
  position: fixed;
  width: 100%;
  height: 100%;
  right: 0;
  top: 0;
  background-color: var(--slate-1);
  z-index: 2;
  transition: transform .2s ease;
  ${(props) => props.$open ? css`
    transform: translateX(0%);
  ` : css`
    transform: translateX(100%)
  `}
`

const SidebarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
`

const NavLink2 = styled(NavLink)`
  all: unset;
  padding: 10px;
  cursor: pointer;
  border-radius: 6px;
  background-color: var(--slate-2);
  &:hover {
    background-color: var(--violet-3);
  }
`

export function Sidebar(props: React.PropsWithChildren<{open: boolean, onClose: () => void}>) {
  const { key } = useLocation()
  const wallet = useWallet()
  const walletModal = useWalletModal()
  React.useEffect(() => props.onClose(), [key])

  return (
    <StyledSidebar $open={props.open}>
      <Box p="2" px="4">
        <Flex justify="between" align="center">
          {!wallet.connected ? (
            <Button disabled={wallet.connecting} onClick={() => walletModal.setVisible(true)} size="2" variant="soft">
              Connect <EnterIcon />
            </Button>
          ) : (
            <Button color="gray" onClick={() => wallet.disconnect()} size="2" variant="soft">
              {wallet.publicKey?.toBase58().substring(0, 6)}...
              <ExitIcon />
            </Button>
          )}
          <Button onClick={props.onClose} color="gray" variant="soft" size="2">
            <Cross1Icon />
          </Button>
        </Flex>
      </Box>
      <Box>
        <SidebarList>
          <NavLink2 to="/create">
            Create Pool
          </NavLink2>
          <NavLink2 to="/user">
            Manage User
          </NavLink2>
          <NavLink2 to="/portfolio">
            Manage Portfolio
          </NavLink2>
          <NavLink2 to="/dao">
            Manage DAO
          </NavLink2>
        </SidebarList>
      </Box>
    </StyledSidebar>
  )
}
