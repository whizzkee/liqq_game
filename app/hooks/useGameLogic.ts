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
  const rafRef = useRef<number>();
  const touchStartTimeRef = useRef(0);
  
  // Use a ref for tracking the last flap time to avoid re-renders
  const lastFlapTimeRef = useRef(0);
  // Minimum time between flaps (16ms is roughly one frame)
  const MIN_FLAP_INTERVAL = 16;

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

    const now = performance.now();
    // Ensure minimum time between flaps to prevent event spamming
    if (now - lastFlapTimeRef.current < MIN_FLAP_INTERVAL) return;
    lastFlapTimeRef.current = now;

    // Cancel any pending RAF to prevent queued updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Immediate state updates for responsiveness
    setVelocity(FLAP_FORCE);
    setTouchActive(true);
    triggerHapticFeedback(HAPTIC_PATTERNS.tap);

    // Use RAF for touch state reset to ensure smooth animation
    rafRef.current = requestAnimationFrame(() => {
      setTouchActive(false);
      rafRef.current = undefined;
    });
  }, [started, gameOver, triggerHapticFeedback]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only handle single touches
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    touchPositionRef.current = { x: touch.clientX, y: touch.clientY };
    touchStartTimeRef.current = performance.now();
    
    handleFlap(e);
  }, [handleFlap]);

  const handleTouchEnd = useCallback(() => {
    setTouchActive(false);
    touchStartTimeRef.current = 0;
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && started && !gameOver) {
      e.preventDefault();
      handleFlap(e);
    }
  }, [started, gameOver, handleFlap]);

  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    handleFlap(e);
  }, [handleFlap]);

  useEffect(() => {
    // Clean up any pending animations on unmount
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Add touch events with passive: false for better touch response
    window.addEventListener('touchstart', handleTouchStart, { 
      passive: false,
      capture: true // Use capture phase for earlier handling
    });
    window.addEventListener('touchend', handleTouchEnd, { capture: true });
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart, { capture: true });
      window.removeEventListener('touchend', handleTouchEnd, { capture: true });
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
    };
  }, [handleTouchStart, handleTouchEnd, handleKeyPress, handleClick]);

  const resetGame = useCallback(() => {
    setGameOver(false);
    setVelocity(0);
    setTouchActive(false);
    lastFlapTimeRef.current = 0;
    touchStartTimeRef.current = 0;
    
    const initialPipes = Array.from({ length: INITIAL_PIPE_COUNT }, (_, i) => 
      generatePipe(5 + i * PIPE_SPACING)
    );
    setPipes(initialPipes);
  }, []);

  useEffect(() => {
    resetGame();
  }, [started, resetGame]);

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
