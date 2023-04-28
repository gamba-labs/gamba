import styled, { keyframes } from 'styled-components'

export const MOBILE = '@media (min-width: 400px)'
export const TABLET = '@media (min-width: 750px)'
export const DESKTOP = '@media (min-width: 1280px)'

export const DEFAULT_COLOR = '#ff5333'

export const StyledButton = styled.button`
  padding: 0 10px;
  margin: 0;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid currentColor;
  color: ${({ theme }) => theme?.palette?.primary?.main ?? DEFAULT_COLOR};
  background: transparent;
  transition: background .1s, color .1s;
  text-transform: uppercase;
  line-height: 40px;
  height: 40px;
  user-select: none;
  display: grid;
  text-align: left;
  align-items: center;
  grid-template-columns: 1fr auto;
  &:disabled {
    color: gray!important;
    cursor: default;
    background: none!important;
    border-color: currentColor!important;
  }
  &:hover {
    background: white;
    color: black;
    border-color: white;
  }
`

export const Padding = styled.div`
  padding: 20px;
`

export const ActionBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 20px;
  display: flex;
  gap: 20px;
  justify-content: center;
  width: 100%;
  z-index: 1;
  width: 100%;
  flex-wrap: wrap;
`

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

export const Loader = styled.div`
  border: 3px solid transparent;
  border-top: 3px solid;
  border-top-color: ${({ theme }) => theme?.palette?.primary?.main ?? DEFAULT_COLOR};
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: ${spin} .5s linear infinite;
`

export const Content = styled.div`
  padding-top: 80px;
`

export const GameWrapper = styled.div`
  height: 100vh;
  display: grid;
  position: relative;
  transition: height .25s ease;
  background: ${({ theme }) => theme.palette.backgroundGame};
  @media (min-height: 960px) {
    height: 800px;
  }
`

export const SubContent = styled.div`
  padding: 20px;
  text-align: center;
`
