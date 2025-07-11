import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import * as Matter from 'matter-js';
import { IdlAccounts, web3 } from '@coral-xyz/anchor';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';

// Styles are now at the top of the component file
const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
`;

type Player = IdlAccounts<Multiplayer>['game']['players'][number];

interface CoinfallsProps {
  players: Player[];
}

function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const getRadiusForWager = (wagerLamports: number) => {
  const minWager = 0.01 * web3.LAMPORTS_PER_SOL;
  const maxWager = 5 * web3.LAMPORTS_PER_SOL;
  const minRadius = 12;
  const maxRadius = 35;

  if (wagerLamports <= minWager) return minRadius;
  if (wagerLamports >= maxWager) return maxRadius;

  const wagerRatio = (wagerLamports - minWager) / (maxWager - minWager);
  return minRadius + wagerRatio * (maxRadius - minRadius);
};

export function Coinfalls({ players }: CoinfallsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine>();
  const prevPlayers = usePrevious(players) ?? [];

  useEffect(() => {
    const engine = Matter.Engine.create({
      gravity: { y: 0.6 },
      enableSleeping: true,
    });
    engineRef.current = engine;

    const container = containerRef.current;
    if (!container) return;

    const render = Matter.Render.create({
      element: container,
      engine,
      options: {
        width: container.clientWidth,
        height: container.clientHeight,
        wireframes: false,
        background: 'transparent',
      },
    });

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    const width = container.clientWidth;
    const height = container.clientHeight;
    const thickness = 100;

    const ground = Matter.Bodies.rectangle(
      width / 2,
      height + thickness / 2,
      width * 2,
      thickness,
      { isStatic: true, render: { visible: false } },
    );

    Matter.World.add(engine.world, [ground]);

    Matter.Events.on(engine, 'afterUpdate', () => {
      engine.world.bodies.forEach(body => {
        if (!body.isStatic) {
          body.render.fillStyle = '#FFD700';
          body.render.opacity = 0.4;
        }
      });
    });

    const handleResize = () => {
      if (!container || !render.canvas) return;
      render.canvas.width = container.clientWidth;
      render.canvas.height = container.clientHeight;
      Matter.Body.setPosition(
        ground,
        { x: container.clientWidth / 2, y: container.clientHeight + thickness / 2 },
      );
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Matter.Runner.stop(runner);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      if (render.canvas && render.canvas.parentNode) {
        render.canvas.parentNode.removeChild(render.canvas);
      }
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current || !containerRef.current) return;

    if (players.length > prevPlayers.length) {
      const prevPlayerKeys = new Set(prevPlayers.map(p => p.user.toBase58()));
      const newPlayers = players.filter(p => !prevPlayerKeys.has(p.user.toBase58()));

      newPlayers.forEach(player => {
        const width = containerRef.current!.clientWidth;
        const radius = getRadiusForWager(player.wager.toNumber());
        const spawnX = width * 0.2 + Math.random() * (width * 0.6);

        const coin = Matter.Bodies.circle(spawnX, -30, radius, {
          restitution: 0.5,
          friction: 0.1,
          render: {
            fillStyle: '#FFD700',
          },
        });
        Matter.World.add(engineRef.current.world, coin);
      });
    }
  }, [players, prevPlayers]);

  return <Container ref={containerRef} />;
}