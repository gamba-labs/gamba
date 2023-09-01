import styled from 'styled-components'

export const SlotContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 10px;
`

export const Perspective = styled.div`
  perspective: 100px;
  user-select: none;
  & > div {
    display: grid;
    gap: 20px;
    transform: rotateX(3deg) rotateY(0deg);
  }
`

export const Result = styled.div`
  border: none;

  padding: 10px;
  text-transform: uppercase;

  @keyframes flash {
    25%, 75% {
      background-color: #ffec63;
      color: #333;
    }
    50% {
      background-color: #ffec6311;
      color: #ffec63;
    }
  }

  position: relative;
  padding: 10px;
  width: 100%;
  border-radius: 10px;
  border-spacing: 10px;
  border: 1px solid #ffec63;
  background-color: #ffec63;
  color: #333;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  animation: flash 2s infinite;
`

export const SlotImage = styled.img`
  aspect-ratio: 1/1;
  max-width: 100%;
  max-height: 100%;
`

export const StyledSlot = styled.div<{
  $numberOfItems: number
  $index: number
  spinning: boolean
  good: boolean
}>`
  width: 100px;
  aspect-ratio: 1/1.5;
  position: relative;
  background: #4444FF11;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #2d2d57;
  pointer-events: none;

  @keyframes ani {
    0% {
      background-position: 200px -200px;
    }
    100% {
      background-position: -200px 200px;
    }
  }

  @keyframes spinning {
    0% {
      top: 0;
    }
    100% {
      top: -${({ $numberOfItems }) => ($numberOfItems - 1) * 100}%;
    }
  }

  @keyframes pulse {
    0%, 30% {
      transform: scale(1)
    }
    10% {
      transform: scale(1.3)
    }
  }

  @keyframes reveal-glow {
    0%, 30% {
      border-color: #2d2d57;
      background: #ffffff00;
    }
    10% {
      border-color: white;
      background: #ffffff33;
    }
  }

  @keyframes shine {
    0%, 30% {
      background: #ffffff00;
    }
    10% {
      background: #ffffff33;
    }
  }

  @keyframes appear {
    0% {
      transform: scale(1.2) translateY(100%);
    }
    100% {
      transform: scale(1) translateY(0%);
    }
  }

  transition: background .2s, border .2s, box-shadow .2s;

  ${({ good, $index }) => good && `
    & > .background {
      animation-delay: 1s;
      opacity: 0.5;
      animation: shine 2s ${$index * .25 + 's'} ease infinite;
    }

    & > .result {
      animation: pulse 2s ${$index * .25 + 's'} cubic-bezier(0.04, 1.14, 0.48, 1.63) infinite;
    }

    border-color: #ffffffcc;
    box-shadow: 0 0 3px #ffec6399;
  `}

  & > .result {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 10px;
  }

  & > .blur {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    filter: brightness(1.25);
    align-items: center;
    opacity: .1;
    filter: blur(10px) brightness(1.75);
    transform: scale(1, 1.5);
  }

  & > .background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-size: 50px;
    background-position: center;
    opacity: 0;
  }

  &:after {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
  }

  @keyframes reveal {
    0% {
      transform: translateY(0%);
      opacity: 1;
    }
    100% {
      transform: translateY(-100%);
      opacity: 0;
    }
  }

  ${({ spinning, $numberOfItems, good }) => spinning ? `
    & > .spinner {
      opacity: 1!important;
      transition: opacity .5s ease;
      transition-delay: .1s;
      animation: spinning ${$numberOfItems / 10}s .1s linear infinite;
    }
    & > .result {
      animation: reveal .5s ease;
      opacity: 0;
    }
  ` : !good && `
    animation: reveal-glow 1s;
    & > .result {
      transition: opacity .5s;
      opacity: 1;
      animation: appear cubic-bezier(0.18, 0.89, 0.32, 1.28) .5s;
    }
  `}

  & > .spinner {
    opacity: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    > div {
      color: white;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      padding: 15px;
    }
  }
`
