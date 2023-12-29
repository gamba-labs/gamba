import { getPlatformMeta } from "@/platforms"
import { Avatar, Flex, Text } from "@radix-ui/themes"
import { AvatarProps } from "@radix-ui/themes/dist/cjs/components/avatar"
import { PublicKey } from "@solana/web3.js"
import React from "react"

interface AccountItemProps {
  address: PublicKey | string
  name?: string
  image?: string
  color?: AvatarProps["color"]
  avatarSize?: AvatarProps["size"]
}

const truncateString = (s: string, startLen = 4, endLen = startLen) => s.slice(0, startLen) + "..." + s.slice(-endLen)

type AccountItemProps2 = Pick<AccountItemProps, "avatarSize" | "address">

export function PlatformAccountItem(props: AccountItemProps2) {
  const meta = getPlatformMeta(props.address)
  return (
    <AccountItem
      image={meta.image}
      name={meta.name}
      {...props}
    />
  )
}

export function PlayerAccountItem(props: AccountItemProps2) {
  return (
    <AccountItem
      color="orange"
      {...props}
    />
  )
}

export function AccountItem({ address, name, image, color, avatarSize }: AccountItemProps) {
  return (
    <Flex gap="2" align="center">
      <Avatar
        size={avatarSize ?? "1"}
        color={color}
        src={image}
        fallback={address.toString().substring(0, 2)}
      />
      <Text>
        {name ?? truncateString(address.toString())}
      </Text>
    </Flex>
  )
}
