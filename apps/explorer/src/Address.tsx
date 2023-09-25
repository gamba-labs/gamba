import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { Box, Container, Flex, Heading, Link } from '@radix-ui/themes'
import React from 'react'
import { useParams } from 'react-router-dom'

export function AddressView() {
  const { address } = useParams<{address: string}>()
  return (
    <Container>
      <Box my="4">
        <Heading mb="3">
          Account
        </Heading>

        {/* <img src={stuff.image} width="100" height="100" /> */}

        <Flex gap="2">
          <Link target="_blank" href={`https://explorer.solana.com/address/${address}`} rel="noreferrer">
            View in Solana Explorer <ExternalLinkIcon />
          </Link>
        </Flex>
      </Box>
    </Container>
  )
}
