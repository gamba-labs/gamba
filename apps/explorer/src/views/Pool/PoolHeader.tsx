import { GearIcon, InfoCircledIcon } from "@radix-ui/react-icons"
import { Dialog, Flex, Heading, IconButton, Text } from "@radix-ui/themes"
import { decodeGambaState, getGambaStateAddress, getPoolBonusAddress, getPoolLpAddress } from "gamba-core-v2"
import { useAccount, useWalletAddress } from "gamba-react-v2"
import React from "react"
import { NavLink, useNavigate } from "react-router-dom"

import { SolanaAddress } from "@/components/SolanaAddress"

import { TokenAvatar } from "@/components"
import { SkeletonFallback } from "@/components/Skeleton"
import { useTokenMeta } from "@/hooks/useTokenMeta"
import { UiPool } from "../Dashboard/PoolList"

export function PoolHeader({pool}: {pool: UiPool}) {
  const token = useTokenMeta(pool.underlyingTokenMint)
  const gambaState = useAccount(getGambaStateAddress(), decodeGambaState)
  const userPublicKey = useWalletAddress()
  const navigate = useNavigate()
  const isPoolAuthority = pool?.poolAuthority?.equals(userPublicKey)
  const isGambaStateAuthority = gambaState?.authority?.equals(userPublicKey)

  return (
    <Flex gap="4" align="center">
      <NavLink to={"/pool/" + pool.publicKey.toBase58()} style={{ display: "contents", color: "unset" }}>
        <TokenAvatar
          size="3"
          mint={pool.underlyingTokenMint}
        />
        <Flex align="center" gap="2">
          <Heading>
            {token.name}
          </Heading>
          <Text color="gray" size="4">
            {token.symbol}
          </Text>
        </Flex>
      </NavLink>

      {(isPoolAuthority || isGambaStateAuthority) && (
        <IconButton size="2" variant="ghost" onClick={() => navigate("/pool/" + pool.publicKey.toString() + "/configure")}>
          <GearIcon />
        </IconButton>
      )}
      <Dialog.Root>
        <Dialog.Trigger>
          <IconButton size="2" variant="ghost">
            <InfoCircledIcon />
          </IconButton>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Pool Details</Dialog.Title>
          <Dialog.Description>
            <Flex direction="column">
              <Text color="gray" size="2">Token mint</Text>
              <SolanaAddress address={pool.underlyingTokenMint} />
            </Flex>
            <Flex direction="column">
              <Text color="gray" size="2">LP Token mint</Text>
              <SolanaAddress address={getPoolLpAddress(pool.publicKey)} />
            </Flex>
            <Flex direction="column">
              <Text color="gray" size="2">Bonus Token mint</Text>
              <SolanaAddress address={getPoolBonusAddress(pool.publicKey)} />
            </Flex>
            <Flex direction="column">
              <Text color="gray" size="2">Pool Address</Text>
              <SolanaAddress address={pool.publicKey} />
            </Flex>
            <Flex direction="column">
              <Text color="gray" size="2">Pool Authority</Text>
              <SkeletonFallback loading={true}>
                <SolanaAddress address={pool?.poolAuthority!} />
              </SkeletonFallback>
            </Flex>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  )
}
