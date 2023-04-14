import styled, { createGlobalStyle } from 'styled-components'

export const MOBILE = '@media (min-width: 400px)'
export const TABLET = '@media (min-width: 750px)'
export const DESKTOP = '@media (min-width: 1280px)'

export const MAIN_COLOR = '#ff5333'

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    user-select: none;
  }
  ::selection {
    color: black;
    background: ${MAIN_COLOR};
  }
  html, body {
    height: 100%;
  }
  body {
    margin: 0;
    color: white;
    background: #090a0d;
    cursor: default;
  }
  h1, h2, h3, h4 {
    margin: 0;
    display: flex;
    gap: .5em;
    align-items: center;
    margin-bottom: .5em;
    font-weight: normal;
  }
  body, input, button, textarea, pre {
    font-family: 'Roboto Mono', sans-serif;
    font-size: 14px;
  }
  a {
    color: unset;
  }
  #root {
    height: 100%;
  }
`

export const Button = styled.button`
  padding: 0 10px;
  margin: 0;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid currentColor;
  color: ${MAIN_COLOR};
  background: transparent;
  transition: background .1s, color .1s;
  text-transform: uppercase;
  line-height: 40px;
  height: 40px;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 10px;
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
  background: #000000CC;
  backdrop-filter: blur(50px);
  z-index: 5;
`

export const GameWrapper = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  width: 100%;
  flex-direction: column;
  background: black;
`
