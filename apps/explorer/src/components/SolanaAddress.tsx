import { useToast } from "@/hooks"
import { ClipboardIcon } from "@radix-ui/react-icons"
import { Flex, IconButton, Link } from "@radix-ui/themes"
import { PublicKey } from "@solana/web3.js"
import React from "react"

interface Props {
  address: PublicKey | string
  truncate?: boolean
  plain?: boolean
}

export function SolanaAddress(props: Props) {
  const toast = useToast()

  const copy = () => {
    window.navigator.clipboard.writeText(props.address.toString())
    toast({ title: "Copied", description: "Copied to clipboard" })
  }

  const address = props.address.toString()

  const text = props.truncate ? address.slice(0, 6) + "..." + address.slice(-6) : address

  return (
    <Flex align="center" gap="2">
      {props.plain ? (
        <>
          {text}
        </>
      ) : (
        <Link target="_blank" href={`https://solscan.io/address/${props.address.toString()}?cluster=devnet`} rel="noreferrer">
          {text}
        </Link>
      )}
      <IconButton variant="ghost" onClick={copy} size="1">
        <ClipboardIcon />
      </IconButton>
    </Flex>
  )
}
