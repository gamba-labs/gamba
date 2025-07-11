import React from 'react';
import * as S from './RecentGames.styles';

export function RecentGames() {
  return (
    <S.Container>
      <S.Title>Recent Games</S.Title>
      <S.List>
        {/* Dummy Content */}
        {[...Array(5)].map((_, i) => (
          <S.GameItem key={i}>
            <S.GameUser>User...{i+1}</S.GameUser>
            <S.GameResult>Won 2.0x</S.GameResult>
          </S.GameItem>
        ))}
      </S.List>
    </S.Container>
  );
}