import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  color: #a9a9b8;
`;

const Ghost = styled.div`
  font-size: 5rem;
  filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
`;

const Text = styled.div`
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
`;


export function Waiting() {
  return (
    <Container>
      <motion.div
        animate={{
          y: [-10, 10, -10],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <Ghost>👻</Ghost>
      </motion.div>
      <Text>Waiting for game...</Text>
    </Container>
  );
}