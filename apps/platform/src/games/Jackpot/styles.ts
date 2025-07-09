import styled, { keyframes } from 'styled-components';

/** Pulse for status badge */
const pulse = keyframes`
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.05); }
`;

/** Outer container */
export const Container = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  padding: 24px;
  max-width: 420px;
  margin: 40px auto;
  color: #eef2f5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
`;

/** Header with title + status + YOU badge */
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

/** Game title */
export const Title = styled.h2`
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
`;

/** YOU indicator */
export const YouBadge = styled.span`
  display: inline-block;
  margin-left: 8px;
  padding: 2px 6px;
  background: #1976d2;
  color: #fff;
  font-size: 0.75rem;
  border-radius: 6px;
  vertical-align: middle;
`;

/** Waiting/Live/Settled badge */
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

/** Countdown wrapper */
export const TimerSection = styled.div`
  margin-bottom: 16px;
`;

/** Bar background */
export const TimerBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

/** Bar fill */
export const TimerProgress = styled.div`
  height: 100%;
  background: #4caf50;
  transition: width 0.3s ease-in-out;
`;

/** MM:SS underneath */
export const TimerText = styled.div`
  text-align: center;
  margin-top: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
`;

/** Vertical list */
export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  line-height: 1.6;
`;

/** Item */
export const Item = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

/** Action buttons row */
export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;
