// src/games/Jackpot/styles.ts
import styled, { css, keyframes } from 'styled-components';

/** simple hover-pulse animation */
const hoverPulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 1rem;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: 600px;
`;

export const Item = styled.li<{ selected?: boolean }>`
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;

  &:hover {
    background: #f9f9f9;
  }

  ${(props) =>
    props.selected &&
    css`
      animation: ${hoverPulse} 0.5s ease infinite;
      background: #e6f7ff;
      border-color: #91d5ff;
    `}
`;
