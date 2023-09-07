import styled from 'styled-components'

export const Section = styled.div`
  padding: 0 20px;
  width: 100%;
  transition: width .25s ease;
  @media (min-width: 900px) {
    padding: 0;
    width: 800px;
  }
  @media (min-width: 1280px) {
    width: 1000px;
  }
  margin: 0 auto;
`
