import { useEffect, useRef, useState } from 'react';
import { FLAP_FORCE, HAPTIC_PATTERNS, INITIAL_PIPE_COUNT, PIPE_SPACING } from '../constants';
import { Pipe } from '../types';
import { generatePipe } from '../utils/gameUtils';

export function useGameLogic(started: boolean, onGameOver: () => void) {
  const [velocity, setVelocity] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [touchActive, setTouchActive] = useState(false);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const lastUpdateTimeRef = useRef(0);
  const frameTimeRef = useRef(0);
  const touchPositionRef = useRef({ x: 0, y: 0 });

  const triggerHapticFeedback = (pattern: number[]) => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.debug('Haptic feedback not supported');
    }
  };

  const handleFlap = (e: TouchEvent | MouseEvent | KeyboardEvent) => {
    if (started && !gameOver) {
      setVelocity(FLAP_FORCE);
      setTouchActive(true);
      triggerHapticFeedback(HAPTIC_PATTERNS.tap);
      
      requestAnimationFrame(() => {
        setTouchActive(false);
      });
    }
  };

  const resetGame = () => {
    setGameOver(false);
    setVelocity(0);
    const initialPipes = Array.from({ length: INITIAL_PIPE_COUNT }, (_, i) => 
      generatePipe(5 + i * PIPE_SPACING)
    );
    setPipes(initialPipes);
  };

  useEffect(() => {
    resetGame();
  }, [started]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      touchPositionRef.current = { x: touch.clientX, y: touch.clientY };
      handleFlap(e);
    };

    const handleTouchEnd = () => {
      setTouchActive(false);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && started && !gameOver) {
        e.preventDefault();
        handleFlap(e);
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      handleFlap(e);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
    };
  }, [started, gameOver]);

  return {
    velocity,
    setVelocity,
    gameOver,
    setGameOver,
    touchActive,
    pipes,
    setPipes,
    lastUpdateTimeRef,
    frameTimeRef,
    touchPositionRef,
    triggerHapticFeedback,
    resetGame
  };
}
