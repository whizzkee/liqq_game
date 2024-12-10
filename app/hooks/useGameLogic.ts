import { useEffect, useRef, useState, useCallback } from 'react';
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
  const velocityRef = useRef(0);

  // Immediate velocity update without state
  const updateVelocity = (newVelocity: number) => {
    velocityRef.current = newVelocity;
    setVelocity(newVelocity);
  };

  const triggerHapticFeedback = useCallback((pattern: number[]) => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.debug('Haptic feedback not supported');
    }
  }, []);

  const handleFlap = useCallback((e: TouchEvent | MouseEvent | KeyboardEvent) => {
    if (!started || gameOver) return;

    // Immediate velocity update
    updateVelocity(FLAP_FORCE);
    setTouchActive(true);
    triggerHapticFeedback(HAPTIC_PATTERNS.tap);

    // Immediate touch state reset
    setTimeout(() => setTouchActive(false), 16);
  }, [started, gameOver, triggerHapticFeedback]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!started || gameOver) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Only handle single touches
    if (e.touches.length !== 1) return;
    
    handleFlap(e);
  }, [handleFlap, started, gameOver]);

  const handleTouchEnd = useCallback(() => {
    setTouchActive(false);
  }, []);

  useEffect(() => {
    // Use passive: false for better touch response
    window.addEventListener('touchstart', handleTouchStart, { 
      passive: false,
      capture: true 
    });
    window.addEventListener('touchend', handleTouchEnd, { capture: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart, { capture: true });
      window.removeEventListener('touchend', handleTouchEnd, { capture: true });
    };
  }, [handleTouchStart, handleTouchEnd]);

  const resetGame = useCallback(() => {
    setGameOver(false);
    updateVelocity(0);
    setTouchActive(false);
    
    const initialPipes = Array.from({ length: INITIAL_PIPE_COUNT }, (_, i) => 
      generatePipe(5 + i * PIPE_SPACING)
    );
    setPipes(initialPipes);
  }, []);

  useEffect(() => {
    resetGame();
  }, [started, resetGame]);

  return {
    velocity: velocityRef.current,
    setVelocity: updateVelocity,
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
