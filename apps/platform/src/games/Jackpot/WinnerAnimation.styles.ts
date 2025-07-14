import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';

const winnerGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px 5px rgba(46, 204, 113, 0.7);
    transform: scale(1.1);
  }
  50% {
    box-shadow: 0 0 30px 10px rgba(46, 204, 113, 1);
    transform: scale(1.15);
  }
`;

export const Wrapper = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(5px);
  z-index: 100;
  gap: 20px;
`;

export const ReelContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 80vw;
  overflow: hidden;
  padding: 20px 0;
  mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
`;

export const Pointer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 100%;
  background: #f39c12;
  box-shadow: 0 0 10px #f39c12;
  z-index: 2;
  border-radius: 2px;
`;

export const PlayerReel = styled(motion.div)`
  display: flex;
`;

export const PlayerCard = styled.div<{ $isWinner: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 100px;
  height: 120px;
  background: #2c2c54;
  border-radius: 10px;
  border: 2px solid #4a4a7c;
  margin: 0 5px;
  transition: all 0.3s ease;
  transform: scale(1); 

  ${({ $isWinner }) => $isWinner && css`
    border-color: #2ecc71;
    animation: ${winnerGlow} 1.5s ease-in-out infinite;
  `}
`;

export const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #4a4a7c;
  margin-bottom: 10px;
`;

export const PlayerAddress = styled.div`
  font-size: 0.8rem;
  color: #e0e0e0;
  font-family: monospace;
`;

export const WinnerText = styled(motion.div)`
  font-size: 1.5rem;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 10px #2ecc71;
  height: 2rem; /* Reserve space to prevent layout shift */
`;