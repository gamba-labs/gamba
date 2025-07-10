// src/games/Jackpot/styles.ts
import styled, { keyframes } from 'styled-components';

/** Pulse for “live” badge */
const pulse = keyframes`
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.05); }
`;

export const Container = styled.div`
  background: rgba(0,0,0,0.6);
  border-radius: 12px;
  padding: 24px;
  max-width: 440px;
  margin: 40px auto;
  color: #eef2f5;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const Title = styled.h2`
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
`;

export const Badge = styled.span<{ status: 'waiting' | 'live' | 'settled' }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #fff;
  ${({ status }) =>
    status === 'waiting'
      ? `background: #f0ad4e;`
      : status === 'live'
      ? `background: #5cb85c; animation: ${pulse} 2s infinite;`
      : `background: #777;`}
`;

export const TimerSection = styled.div`
  margin-bottom: 16px;
`;

export const TimerBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
`;

export const TimerProgress = styled.div`
  height: 100%;
  background: #4caf50;
  transition: width 0.3s ease-in-out;
`;

export const TimerText = styled.div`
  text-align: center;
  margin-top: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
`;

export const Pot = styled.div`
  text-align: center;
  margin: 20px 0;
  color: #ffdf00;
`;

export const PotValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
`;

export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
`;

export const Item = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;
