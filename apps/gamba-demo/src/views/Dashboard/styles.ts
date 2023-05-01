import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

export const Grid = styled.div`
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
  @media (min-width: 800px) {
    gap: 20px;
    justify-content: unset;
  }
`

export const Section = styled.div`
  padding: 10px;
  width: 100%;
  @media (min-width: 800px) {
    width: 720px;
  }
  display: grid;
  gap: 10px;
  margin: 0 auto;
  padding: 20px;
`

export const Banner = styled.div`
  position: relative;
  background-image: url(https://pbs.twimg.com/media/FuPzmfjXwAQsBr4?format=jpg&name=4096x4096);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  & > div {
    z-index: 1;
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    display: flex;
    align-items: flex-end;
    text-align: left;
    animation: ${fadeIn} .5s;
  }
  &:after {
    content: "";
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    background-image: linear-gradient(0deg, ${({ theme }) => theme.palette.background} 0%, ${({ theme }) => theme.palette.background}00 100%);
  }
`
