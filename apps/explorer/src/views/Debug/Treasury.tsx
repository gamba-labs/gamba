import { Button, Card, Flex, Grid, TextField } from "@radix-ui/themes"
import { getGambaStateAddress } from "gamba-core-v2"
import React from "react"

import { TokenItem } from "@/components"
import { useTokenAccountsByOwner } from "@/hooks"

export default function Treasury() {
  const [owner, setOwner] = React.useState(getGambaStateAddress().toBase58())
  const tokens = useTokenAccountsByOwner(getGambaStateAddress())

  return (
    <Grid gap="4">
      {/* <Flex justify="between">
        <TextField.Root>
          <TextField.Input
            size="3"
            value={owner}
            onFocus={e => e.target.select()}
            onChange={e => setOwner(e.target.value)}
          />
        </TextField.Root>
        <Button size="3" variant="soft">
          Check
        </Button>
      </Flex> */}
      <Card>
        <Grid gap="4">
          {tokens.length > 0 && (
            <>
              <Grid gap="2">
                {tokens.map((token, i) => (
                  <Card key={i}>
                    <TokenItem
                      mint={token.mint}
                      balance={token.amount}
                    />
                  </Card>
                ))}
              </Grid>
            </>
          )}
        </Grid>
      </Card>
    </Grid>
  )
}
