import styled, { DefaultTheme, createGlobalStyle } from 'styled-components'

export const MOBILE = '@media (min-width: 400px)'
export const TABLET = '@media (min-width: 750px)'
export const DESKTOP = '@media (min-width: 1280px)'

declare module 'styled-components' {
  export interface DefaultTheme {
    palette: {
      background: string,
      textColor: string,
      backgroundGame: string,
      primary: string,
    },
  }
}

export const theme: DefaultTheme = {
  palette: {
    background: '#080809',
    textColor: '#ffffff',
    backgroundGame: '#0f0f16',
    primary: '#ff335c',
  },
}

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  ::selection {
    color: black;
    background: ${({ theme }) => theme.palette.primary};
  }
  html, body {
    height: 100%;
    overflow-x: hidden;
  }
  button {
    user-select: none;
  }
  body {
    margin: 0;
    color: ${({ theme }) => theme.palette.textColor};
    background: ${({ theme }) => theme.palette.background};
    cursor: default;
    overflow-y: auto;
    &::scrollbar {
      width: .2em;
    }
    &::scrollbar-thumb {
      background-color: white;
    }
  }
  h1, h2, h3, h4 {
    margin: 0;
    margin-bottom: 20px;
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
