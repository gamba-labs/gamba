import styled from 'styled-components'

export const Slider = styled.div<{$minimized?: boolean}>`
  display: flex;
  gap: 10px;
  width: 100%;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  height: ${({ $minimized }) => $minimized ? '75px' : '200px'};
  transition: height .25s ease;
  &::-webkit-scrollbar {
    height: .4em;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #cccccc33;
  }
  & > * {
    scroll-snap-align: start;
  }
`
