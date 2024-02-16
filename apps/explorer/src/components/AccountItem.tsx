import { useBonfidaName } from "@/hooks"
import { getPlatformMeta } from "@/platforms"
import { Avatar, Flex, Text } from "@radix-ui/themes"
import { AvatarProps } from "@radix-ui/themes/dist/cjs/components/avatar"
import { PublicKey } from "@solana/web3.js"
import { minidenticon } from 'minidenticons'
import React from "react"

interface AccountItemProps {
  address: PublicKey | string
  name?: string
  image?: string
  color?: AvatarProps["color"]
  avatarSize?: AvatarProps["size"]
}

export const truncateString = (s: string, startLen = 4, endLen = startLen) => s.slice(0, startLen) + "..." + s.slice(-endLen)

type AccountItemProps2 = Pick<AccountItemProps, "avatarSize" | "address">

export function PlatformAccountItem(props: AccountItemProps2) {
  const meta = getPlatformMeta(props.address)
  const domainName = useBonfidaName(props.address)
  const image = React.useMemo(() => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(props.address.toString())), [props.address])
  return (
    <AccountItem
      {...props}
      image={meta.image ?? image}
      name={meta.name ?? domainName}
    />
  )
}

export function PlayerAccountItem(props: AccountItemProps2) {
  const domainName = useBonfidaName(props.address)
  const image = React.useMemo(() => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(props.address.toString())), [props.address])
  return (
    <AccountItem
      color="orange"
      {...props}
      name={domainName}
      image={image}
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
