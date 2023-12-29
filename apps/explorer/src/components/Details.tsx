import { Box, Grid, Table } from "@radix-ui/themes"
import React, { ReactNode } from "react"

interface Props {
  title?: ReactNode
  rows: [name: string, value: React.ReactNode][]
}

export function Details({ title, rows }: Props) {
  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>
            {title}
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      {rows.map(([name, value], index) => (
        <Table.Body key={index}>
          <Table.Row>
            <Table.Cell>
              <Grid columns="2" gap="4">
                <Box>
                  {name}
                </Box>
                <Box>
                  {value}
                </Box>
              </Grid>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      ))}
    </Table.Root>
  )
}
