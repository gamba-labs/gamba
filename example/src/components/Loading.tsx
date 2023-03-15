import React from 'react'
import styled, { keyframes } from 'styled-components'

const animation = keyframes`
 0% { left: -200%; }
 100% { left: 100%; }
`

const Wrapper = styled.div<{$loading: boolean}>`
  width: 100%;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
  transform: opacity .5s;
  height: 5px;
  opacity: ${({$loading}) => $loading ? '1' : '0'};
  & > div {
    width: 50%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: #fff;
    border-radius: 5px;
    animation: ${animation} .5s infinite;
  }
`

export function Loading({loading}: {loading: boolean}) {
  return (
    <Wrapper $loading={loading}>
      {loading && <div />}
    </Wrapper>
  )
}
