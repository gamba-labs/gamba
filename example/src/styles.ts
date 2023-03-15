import styled, { createGlobalStyle, css } from 'styled-components'

export const MOBILE = '@media (min-width: 400px)'
export const TABLET = '@media (min-width: 750px)'
export const DESKTOP = '@media (min-width: 1280px)'

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  html, body {
    height: 100%;
  }
  body {
    margin: 0;
    color: black;
    text-align: center;
    background: #090a0d;
    cursor: default;
  }
  h1, h2, h3, h4 {
    margin: 0;
  }
  body, input, button, textarea, pre {
    font-family: arial;
    font-size: 16px;
  }
  #root {
    height: 100%;
  }
`

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`

export const Wrapper = styled.div`
  padding: 20px;
  background: #fafafa;
  border-radius: 20px;
  border: 1px solid #ccc;
  display: grid;
  gap: 20px;
  min-width: 320px;
  max-width: 100%;
  background: #191c23;
  border: none;
  color: white;
  position: relative;
`

export const Controls = styled.div`
  display: grid;
  gap: 20px;
`

export const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  & > * {
    flex-grow: 1;
  }
`

export const Info = styled.div`
  font-size: 14px;
  display: flex;
  justify-content: space-between;
`

export const Input = styled.input`
  padding: 15px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 10px;
  border: none;
  background: rgb(47 51 60);
  color: white;
  outline: none;
  transition: background .1s;
  &:focus {
    background: rgb(58 63 75);
  }
`

export const ButtonCSS = css<{$gradient?: boolean}>`
  padding: 15px;
  color: white;
  background: rgb(47 51 60); //linear-gradient(180deg,rgba(255,124,83,1) -25%,rgba(255,85,85,1) 48%,rgba(255,10,83,1) 125%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  min-width: 100px;
  transition: background .1s;
  outline: none;
  &:hover, &:focus {
    background: rgb(58 63 75);
  }
  &:disabled {
    cursor: default;
    background: #090f1b33;
  }
  ${({$gradient}) => $gradient && `
    transition: background .5s;
    background-image: linear-gradient(90deg,rgba(255,124,83,1) -0%,rgba(255,85,85,1) 48%,rgba(255,10,83,1) 100%);
    &:hover {
      background-image: linear-gradient(90deg,rgba(255,124,83,1) -25%,rgba(255,85,85,1) 48%,rgba(255,10,83,1) 125%);
    }
  `}
`

export const Button = styled.button`
  ${ButtonCSS}
`

export const SmallButton = styled.button`
  ${ButtonCSS}
  font-size: 12px;
  padding: 5px;
  min-width: unset;
`

export const Amount = styled.div<{$value: number}>`
  color: ${({$value}) => $value >= 0 ? '#00ff83' : '#ff2862'};
  font-weight: bold;
`
