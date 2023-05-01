import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

export const Loader = styled.div`
  border: 6px solid transparent;
  border-top: 6px solid ${({ theme }) => theme.palette.primary};
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: ${spin} .5s linear infinite;
`
