import { TopCreatorsData, fetchTopCreators } from "@/api"
import { PlatformAccountItem } from "@/components/AccountItem"
import { TableRowNavLink } from "@/components/TableRowLink"
import { getPlatformMeta } from "@/platforms"
import { Avatar, Flex, Table, Text } from "@radix-ui/themes"
import React from "react"
import styled from "styled-components"
import useSWR from "swr"

const SkeletonText = styled.div`
  height: 1em;
  min-width: 40px;
  background: #cccccccc;
  border-radius: 5px;
`

const StyledTableCell = styled(Table.Cell)`
  vertical-align: middle;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`

function PlatformTableRow({ platform }: { platform: TopCreatorsData }) {
  const meta = getPlatformMeta(platform.creator)

  return (
    <TableRowNavLink to={"/platform/" + platform.creator}>
      <StyledTableCell>
        <Flex gap="4" align="center">
          <PlatformAccountItem avatarSize="2" address={meta.address} />
        </Flex>
      </StyledTableCell>
      <StyledTableCell>
        <Text>${platform.usd_volume.toLocaleString(undefined, {maximumFractionDigits: 2})}</Text>
      </StyledTableCell>
      <StyledTableCell>
      </StyledTableCell>
    </TableRowNavLink>
  )
}

export function TopPlatforms() {
  const { data: platforms = [], isLoading } = useSWR("top-platforms", fetchTopCreators)

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Volume</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {isLoading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Table.Row key={i}>
                <StyledTableCell>
                  <Flex gap="4" align="center">
                    <Avatar
                      fallback="-"
                      size="2"
                    />
                    <SkeletonText style={{ width: "150px" }} />
                  </Flex>
                </StyledTableCell>
                {Array.from({ length: 4 }).map((_, i) => (
                  <StyledTableCell key={i}>
                    <SkeletonText />
                  </StyledTableCell>
                ))}
              </Table.Row>
            ))}
          </>
        ) : (
          <>
            {platforms.map((platform) => (
              <PlatformTableRow
                key={platform.creator}
                platform={platform}
              />
            ))}
          </>
        )}
      </Table.Body>
    </Table.Root>
  )
}
