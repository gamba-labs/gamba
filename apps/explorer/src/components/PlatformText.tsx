import React from 'react'
import { Flex } from "@radix-ui/themes";
import { getCreatorMeta } from "../data";
import { PublicKey } from "@solana/web3.js";
import styled from 'styled-components'

export const PlatformIcon = styled.div`
  width: 24px;
  height: 24px;
  position: relative;
  border-radius: 50%;
  background: #cccccc11;
  & > img {
    width: 100%;
    height: 100%;
  }
`

export function PlatformText({address}: {address: PublicKey | string}) {
  const meta = getCreatorMeta(address)
  return (
    <Flex gap="2">
      <PlatformIcon>
        {meta.image && <img src={meta.image} />}
      </PlatformIcon>
      {meta.name}
    </Flex>
  )
}
