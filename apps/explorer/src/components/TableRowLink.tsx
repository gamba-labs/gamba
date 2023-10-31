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
    background: var(--accent-a1);
  }
`

export const TableRowNavLink = ({to, children, ...rest}: Props) => {
  const navigate = useNavigate()
  const openLink = (newTab: boolean) => {
    if (newTab) {
      return window.open(to, '_blank', 'rel=noopener noreferrer')
    }
    navigate(to, {})
  }
  return (
    <StyledTableRow {...rest} onClick={(e) => openLink(e.ctrlKey || e.metaKey)}>
      {children}
    </StyledTableRow>
  )
}
