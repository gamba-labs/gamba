import { Avatar, Flex, Text } from "@radix-ui/themes"
import { PublicKey } from "@solana/web3.js"
import { TokenValue, useTokenMeta } from "gamba-react-ui-v2"
import React from "react"
import styled, { css } from "styled-components"

export const SelectableButton = styled.button<{selected?: boolean}>`
  all: unset;
  display: block;
  border-radius: max(var(--radius-2), var(--radius-full));
  width: 100%;
  padding: 5px 10px;
  box-sizing: border-box;
  cursor: pointer;
  transition: background .1s;
  ${props => props.selected ? css`
    background: var(--accent-a3);
  ` : css`
    &:hover {
      background: var(--accent-a2);
    }
    background: transparent;
    color: inherit;
  `}
`

export const Address = (props: {children: string}) => {
  return (
    <span title={props.children}>
      {props.children.slice(0, 6) + "..." + props.children.slice(-6)}
    </span>
  )
}

interface TokenItemProps {
  mint: PublicKey
  balance: number
  stuff?: React.ReactNode
}

export function TokenAvatar(props: {mint: PublicKey, size?: "1" | "2" | "3"}) {
  const metaData = useTokenMeta(props.mint)
  return (
    <Avatar
      radius="full"
      fallback="?"
      size={props.size ?? "3"}
      color="green"
      src={metaData.image}
    />
  )
}

export function TokenItem({ mint, balance, stuff }: TokenItemProps) {
  const metaData = useTokenMeta(mint)

  return (
    <Flex gap="4" justify="between" align="center">
      <Flex grow="1" gap="4" align="center">
        <TokenAvatar mint={mint} />
        <Flex grow="1" direction="column">
          <Flex justify="between">
            <Text weight="bold">
              {metaData.name}
            </Text>
          </Flex>
          <Flex justify="between">
            <Text color="gray">
              <Address>
                {mint.toBase58()}
              </Address>
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Text>
        <TokenValue mint={mint} amount={balance} />
      </Text>
      {stuff}
    </Flex>
  )
}
