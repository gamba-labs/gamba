import styled from 'styled-components'

export const Section = styled.div`
  padding: 10px;
  width: 100%;
  transition: width .25s ease;
  @media (min-width: 900px) {
    width: 800px;
  }
  @media (min-width: 1280px) {
    width: 1200px;
  }
  display: grid;
  gap: 10px;
  margin: 0 auto;
`
