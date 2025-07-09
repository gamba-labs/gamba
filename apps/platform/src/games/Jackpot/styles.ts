// src/games/Jackpot/styles.ts
import styled, { keyframes } from 'styled-components';

/** Pulse for “live” status badge */
const pulse = keyframes`
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.1); }
`;

/** The outer container, semi-transparent dark */
export const Container = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border-radius: 16px;
  padding: 24px;
  max-width: 480px;
  margin: 40px auto;
  color: #eef2f5;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
`;

/** Title at top */
export const Title = styled.h2`
  margin: 0 0 16px;
  color: #fff;
  font-size: 1.6rem;
  text-align: center;
`;

/** Simple list wrapper */
export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

/** Individual selectable item */
export const Item = styled.li<{ clickable?: boolean }>`
  padding: 12px 16px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  transition: background 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

/** Status badge in header */
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
