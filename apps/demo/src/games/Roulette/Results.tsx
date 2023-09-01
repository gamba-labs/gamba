import React from 'react'
import styled from 'styled-components'
import { getNumberInfo } from './constants'
import { Loader, numberColorToHex } from './styles'

export const Wrapper = styled.div`
  border-radius: 5px;
  background: #292a307d;
  margin: 0 auto;
  font-weight: bold;
  overflow: hidden;
  width: 100%;
  & > div {
    display: flex;
  }
`

export const Result = styled.div<{$color: 'red' | 'black' | 'none'}>`
  color: ${({ $color }) => numberColorToHex($color).text};
  display: flex;
  align-items: ${({ $color }) => $color === 'red' ? 'end' : 'baseline'};
  padding: 10px;
  width: 40px;
  justify-content: center;
  &:first-child {
    height: 62px;
    font-size: 24px;
    align-items: center;
    width: 60px;
    justify-content: center;
    box-shadow: 2px 0px 10px #00000033;
    background: #FFFFFF11;
  }
`

export function Results({ loading, results }: {loading?: boolean, results: number[]}) {
  const [firstResult] = results

  return (
    <Wrapper>
      <div>
        <Result $color={typeof firstResult === 'number' ? getNumberInfo(firstResult).color : 'none'}>
          <div>
            {loading ? <Loader /> : typeof firstResult === 'number' ? firstResult + 1 : '-'}
          </div>
        </Result>
        {results.slice(loading ? 0 : 1, loading ? 10 : 11).map((x, i) => {
          return (
            <Result $color={getNumberInfo(x).color} key={i}>
              <div>
                {x + 1}
              </div>
            </Result>
          )
        })}
      </div>
    </Wrapper>
  )
}
