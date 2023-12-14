import styled, { keyframes } from 'styled-components'

const resultFlash = keyframes`
  from { background-color: white;}
  to { background-color: #292a307d;}
`

export const StyledResults = styled.div`
  border-radius: 10px;
  background: #191c2fa1;
  margin: 0 auto;
  font-weight: bold;
  overflow: hidden;
  width: 100%;
  display: flex;
  height: 50px;

  & > div {
    display: flex;
    padding: 10px;
    width: 40px;
    justify-content: center;
  }

  & > div:first-child {
    font-size: 24px;
    align-items: center;
    width: 60px;
    justify-content: center;
    background: #FFFFFF11;
    animation: ${resultFlash} 1s;
  }
`
