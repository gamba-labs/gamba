import React from 'react'
import { Container, Flex } from "@radix-ui/themes"
import { useNavigate, useParams } from "react-router-dom"
import { Loader } from "./components/Loader"
import { isPubkey, isSignature } from './utils'
import { getBets } from './api'

export function Search() {
  const {signatureOrAddress} = useParams<{signatureOrAddress: string}>()
  const [loading, setLoading] = React.useState(true)
  const navigate = useNavigate()
  React.useEffect(
    () => {
      const load = async () => {
        try {
          if (!signatureOrAddress) throw new Error('No search param')
          if (isPubkey(signatureOrAddress)) {
            const creator = await getBets({page: 0, creator: signatureOrAddress })
            if (creator.length)
              return navigate('/platform/' + signatureOrAddress)
            return navigate('/player/' + signatureOrAddress)
          } else if (isSignature(signatureOrAddress)) {
            navigate('/play/' + signatureOrAddress)
          } else {
            throw new Error('Not a valid transaction or address')
          }
        } finally {
          setLoading(true)
        }
      }
      load()
    },
    []
  )

  return (
    <Container>
      <Flex justify="center" align="center" p="4">
        <Loader />
      </Flex>
    </Container>
  )
}
