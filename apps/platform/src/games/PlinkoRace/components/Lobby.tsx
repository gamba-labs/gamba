// src/components/Lobby.tsx
import React from 'react';
import styled from 'styled-components';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useGames } from 'gamba-react-v2';

type LobbyProps = {
  onSelect: (pk: PublicKey) => void;
  onDebug : () => void;
};

const LobbyLayout   = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
const Header        = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const H1            = styled.h1`
  margin: 0;
  font-size: 2rem;
`;
const RefreshButton = styled.button`
  padding: 6px 12px;
  font-weight: 600;
  cursor: pointer;
`;
const CardGrid      = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 16px;
`;
const Card          = styled.div`
  background: #111;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: transform .1s ease;
  &:hover { transform: translateY(-2px) }
`;
const GameId        = styled.span`
  font-weight: 600;
`;
const Badge         = styled.span<{ $status: 'waiting'|'live'|'settled' }>`
  padding: 2px 8px;
  border-radius: 6px;
  font-size: .75rem;
  text-transform: uppercase;
  background: ${p =>
    p.$status === 'waiting' ? '#555'
    : p.$status === 'live'    ? '#047857'
                              : '#6b7280'};
`;
const Pot           = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 8px 0;
`;
const Players       = styled.div`
  font-size: .875rem;
  opacity: .8;
`;
const Wager         = styled.div`
  font-size: .875rem;
  opacity: .8;
  margin-top: 4px;
`;
const EnterBtn      = styled.button`
  margin-top: 12px;
  padding: 8px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;

function sol(lamports: number) {
  return lamports / LAMPORTS_PER_SOL;
}

export default function Lobby({ onSelect, onDebug }: LobbyProps) {
  const { games, loading, refresh } = useGames();

  return (
    <LobbyLayout>
      <Header>
        <H1>Plinko Race Lobby</H1>
        <RefreshButton onClick={refresh}>
          {loading ? 'Loading…' : 'Refresh'}
        </RefreshButton>
      </Header>

      <CardGrid>
        {games.map(g => {
          const players     = g.account.players;
          const status      = g.account.state.settled
                               ? 'settled' as const
                               : g.account.state.waiting
                                 ? 'waiting' as const
                                 : 'live'    as const;
          const totalPotLam = players.reduce((sum, p) => sum + p.wager.toNumber(), 0);
          const totalPot    = sol(totalPotLam);

          const fixedLam    = g.account.wager.toNumber();
          const hasFixed    = fixedLam > 0;
          const fixedSol    = sol(fixedLam);

          return (
            <Card
              key={g.publicKey.toBase58()}
              onClick={() => onSelect(g.publicKey)}
            >
              <div>
                <GameId>Game #{g.account.gameId.toString()}</GameId>
                <Badge $status={status} style={{ marginLeft: 8 }}>
                  {status}
                </Badge>
                <Pot>{totalPot.toFixed(2)} SOL</Pot>
                <Players>
                  {players.length} / {g.account.maxPlayers} players
                </Players>
                {hasFixed && (
                  <Wager>Wager: {fixedSol.toFixed(2)} SOL</Wager>
                )}
              </div>
              <EnterBtn>Enter</EnterBtn>
            </Card>
          );
        })}

        {/* ─── Debug Simulator card ────────────────────────── */}
        <Card onClick={onDebug}>
          <div style={{ textAlign: 'center', flexGrow: 1 }}>
            <span style={{ fontSize: 48 }}>🐞</span>
            <h3 style={{ margin: '8px 0 4px' }}>Debug Simulator</h3>
            <p style={{ opacity: .75, fontSize: '.9rem' }}>
              Run offline races
            </p>
          </div>
        </Card>
      </CardGrid>

      {!loading && games.length === 0 && (
        <p>No live games right now – create or wait for one!</p>
      )}
    </LobbyLayout>
  );
}
