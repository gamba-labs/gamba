import { Box, Grid, Table } from "@radix-ui/themes"
import React, { ReactNode } from "react"

type Row = [title: string, value: React.ReactNode]

interface Props {
  title?: ReactNode
  rows: (Row | null | undefined | false)[]
}

export function Details({ title, rows }: Props) {
  const trimmed = rows.filter((x) => !!x) as Row[]
  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>
            {title}
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      {trimmed.map(([title, value], index) => (
        <Table.Body key={index}>
          <Table.Row>
            <Table.Cell>
              <Grid columns="2" gap="4">
                <Box>
                  {title}
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
