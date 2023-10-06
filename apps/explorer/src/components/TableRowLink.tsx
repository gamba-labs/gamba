import { Table } from "@radix-ui/themes"
import { TableRowProps } from "@radix-ui/themes/dist/cjs/components/table"
import React from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"

interface Props extends TableRowProps, Omit<React.RefAttributes<HTMLTableRowElement>, 'role'> {
  to: string
}

const StyledTableRow = styled(Table.Row)`
  cursor: pointer;
  &:hover {
    background: var(--accent-a1);
  }
`

const StyledLink = styled(Link)`
  all: unset;
  display: contents;
`

export const TableRowNavLink = ({to, children, ...rest}: Props) => {
  return (
    <StyledLink to={to}>
      <StyledTableRow {...rest}>
          {children}
      </StyledTableRow>
    </StyledLink>
  )
}
