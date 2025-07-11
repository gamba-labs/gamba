import styled from 'styled-components';

export const Container = styled.div`
  background: #23233b;
  border-radius: 15px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h3`
  margin: 0 0 10px 0;
  color: #fff;
  font-size: 1rem;
  text-align: center;
`;

export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const GameItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2c2c54;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #4a4a7c;
`;

export const GameUser = styled.div`
  font-size: 0.8rem;
  font-family: monospace;
  color: #e0e0e0;
`;

export const GameResult = styled.div`
  font-size: 0.8rem;
  font-weight: bold;
  color: #2ecc71;
`;