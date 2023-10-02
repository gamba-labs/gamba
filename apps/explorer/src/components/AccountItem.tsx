import { Avatar, Flex, Text } from "@radix-ui/themes";
import { PublicKey } from "@solana/web3.js";
import React from 'react';
import { getCreatorMeta } from "../data";
import { AvatarProps } from "@radix-ui/themes/dist/cjs/components/avatar";
import { truncateString } from "../utils";

export function PlatformAccountItem({ address }: {address: PublicKey | string}) {
  const meta = getCreatorMeta(address)
  return (
    <AccountItem image={meta.image} name={meta.name} address={meta.address} />
  )
}

export function PlayerAccountItem({ address }: {address: PublicKey | string}) {
  return (
    <AccountItem color="orange" address={address} />
  )
}

export function AccountItem({ address, name, image, color }: {address: PublicKey | string, name?: string, image?: string, color?: AvatarProps['color']}) {
  return (
    <Flex gap="2">
      <Avatar
        size="1"
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
