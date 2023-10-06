import { Avatar, Flex, Text } from "@radix-ui/themes";
import { PublicKey } from "@solana/web3.js";
import React from 'react';
import { getCreatorMeta } from "../data";
import { AvatarProps } from "@radix-ui/themes/dist/cjs/components/avatar";
import { truncateString } from "../utils";

interface AccountItemProps {
  address: PublicKey | string
  name?: string
  image?: string
  color?: AvatarProps['color']
  avatarSize?: AvatarProps['size']
}

type AccountItemProps2 = Pick<AccountItemProps, 'avatarSize' | 'address'>

export function PlatformAccountItem(props: AccountItemProps2) {
  const meta = getCreatorMeta(props.address)
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
    <Flex gap={avatarSize ? '4' : '2'} align="center">
      <Avatar
        size={avatarSize ?? '1'}
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
