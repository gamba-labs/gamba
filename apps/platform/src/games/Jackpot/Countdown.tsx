import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
  /* Give the wrapper a stable width */
  width: 100%;
`;

const Time = styled.div`
  font-size: 2.5rem;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  /* Ensures numbers have a fixed width and don't cause layout shifts */
  font-variant-numeric: tabular-nums;
`;

const ProgressBar = styled.div`
  width: 80%;
  height: 8px;
  background: #2c2c54;
  border-radius: 4px;
  margin-top: 5px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #f39c12, #f1c40f);
  border-radius: 4px;
  /* Use a smoother transition */
  transition: width 0.5s cubic-bezier(0.25, 1, 0.5, 1);
`;

interface CountdownProps {
  softExpiration: number;
  onComplete: () => void;
}

export const Countdown: React.FC<CountdownProps> = ({
  softExpiration,
  onComplete,
}) => {
  const initialDurationRef = useRef(softExpiration - Date.now());
  const [timeLeft, setTimeLeft] = useState(initialDurationRef.current);

  useEffect(() => {
    // Reset the initial duration only when the expiration timestamp changes
    initialDurationRef.current = softExpiration - Date.now();
    setTimeLeft(initialDurationRef.current);
  }, [softExpiration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(Math.max(softExpiration - Date.now(), 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [softExpiration, timeLeft, onComplete]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = Math.min(((initialDurationRef.current - timeLeft) / initialDurationRef.current) * 100, 100);

  return (
    <Wrapper>
      <Time>{formatTime(timeLeft)}</Time>
      <ProgressBar>
        <Progress style={{ width: `${progress}%` }} />
      </ProgressBar>
    </Wrapper>
  );
};