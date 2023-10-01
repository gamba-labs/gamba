import { Table } from "@radix-ui/themes"
import { TableRowProps } from "@radix-ui/themes/dist/cjs/components/table"
import React from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

interface Props extends TableRowProps, Omit<React.RefAttributes<HTMLTableRowElement>, 'role'> {
  to: string
}

const StyledTableRow = styled(Table.Row)`
  cursor: pointer;
  &:hover {
    background: var(--accent-a2);
  }
`

export const TableRowNavLink = ({to, ...rest}: Props) => {
  const navigate = useNavigate()

  return (
    <StyledTableRow role="button" onClick={() => navigate(to)} {...rest} />
  )
}
