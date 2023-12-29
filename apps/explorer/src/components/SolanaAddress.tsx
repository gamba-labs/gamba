import { useToast } from "@/hooks"
import { ClipboardIcon } from "@radix-ui/react-icons"
import { Flex, IconButton, Link } from "@radix-ui/themes"
import { PublicKey } from "@solana/web3.js"
import React from "react"

export function SolanaAddress(props: {address: PublicKey}) {
  const toast = useToast()

  const copy = () => {
    window.navigator.clipboard.writeText(props.address.toBase58())
    toast({ title: "Copied", description: "Copied to clipboard" })
  }

  return (
    <Flex align="center" gap="2">
      <Link target="_blank" href={`https://solscan.io/address/${props.address.toBase58()}?cluster=devnet`} rel="noreferrer">
        {props.address.toBase58()}
      </Link>
      <IconButton variant="ghost" onClick={copy} size="1">
        <ClipboardIcon />
      </IconButton>
    </Flex>
  )
}
