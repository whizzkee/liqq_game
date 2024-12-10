import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, useMemo, useState } from 'react';
import * as THREE from 'three';
import { GRAVITY, HAPTIC_PATTERNS, PIPE_WIDTH, LIQQ_SIZE, PIPE_GAP, GAME_SPEED } from '@/app/constants';
import { GameSceneProps } from '@/app/types';
import { Liqq } from './Liqq';
import { TopPipe, BottomPipe } from './Pipes';
import { useGameLogic } from '@/app/hooks/useGameLogic';

export function GameScene({ onScoreChange, started, onGameOver }: GameSceneProps) {
  const liqqRef = useRef<THREE.Mesh>(null);
  const lastFrameTime = useRef(0);
  const accumulatedTime = useRef(0);
  const FIXED_TIME_STEP = 1000 / 60; // 60 FPS
  const [score, setScore] = useState(0);

  const {
    velocity,
    setVelocity,
    gameOver,
    setGameOver,
    touchActive,
    pipes,
    setPipes,
    lastUpdateTimeRef,
    frameTimeRef,
    triggerHapticFeedback
  } = useGameLogic(started, onGameOver);

  // Memoize collision checks for performance
  const checkCollision = useCallback((liqqX: number, liqqY: number, pipe: { x: number, gapY: number }) => {
    if (Math.abs(liqqX - pipe.x) < (PIPE_WIDTH + LIQQ_SIZE) / 2) {
      return (liqqY + LIQQ_SIZE > pipe.gapY + PIPE_GAP/2 || 
              liqqY - LIQQ_SIZE < pipe.gapY - PIPE_GAP/2);
    }
    return false;
  }, []);

  // Memoize pipe movement calculation
  const movePipes = useCallback((delta: number) => {
    setPipes(prevPipes => {
      const movement = GAME_SPEED * delta * 60;
      return prevPipes
        .map(pipe => ({
          ...pipe,
          x: pipe.x - movement,
        }))
        .filter(pipe => pipe.x > -10);
    });
  }, []);

  useFrame((_, delta) => {
    if (!liqqRef.current || !started || gameOver) return;

    // Fixed timestep accumulator for consistent physics
    const currentTime = performance.now();
    const frameTime = Math.min(currentTime - lastFrameTime.current, 100);
    lastFrameTime.current = currentTime;
    
    accumulatedTime.current += frameTime;

    // Update physics with fixed timestep
    while (accumulatedTime.current >= FIXED_TIME_STEP) {
      const fixedDelta = FIXED_TIME_STEP / 1000;
      
      // Physics update with fixed timestep
      const newVelocity = velocity - (GRAVITY * fixedDelta * 60);
      setVelocity(newVelocity);
      
      const positionDelta = newVelocity * fixedDelta;
      if (liqqRef.current) {
        liqqRef.current.position.y += positionDelta;
      }

      accumulatedTime.current -= FIXED_TIME_STEP;
    }

    // Smooth rotation interpolation
    if (liqqRef.current) {
      const targetRotation = touchActive ? 
        Math.PI / 6 : 
        Math.max(Math.min(velocity * 0.1, Math.PI / 4), -Math.PI / 4);
      
      liqqRef.current.rotation.z = THREE.MathUtils.lerp(
        liqqRef.current.rotation.z,
        targetRotation,
        Math.min(1, delta * 10)
      );

      // Boundary check
      if (liqqRef.current.position.y < -10 || liqqRef.current.position.y > 10) {
        if (!gameOver) {
          setGameOver(true);
          onGameOver();
          triggerHapticFeedback(HAPTIC_PATTERNS.gameOver);
        }
        return;
      }

      // Optimized collision and scoring checks
      const liqqX = liqqRef.current.position.x;
      const liqqY = liqqRef.current.position.y;

      for (const pipe of pipes) {
        // Collision check
        if (checkCollision(liqqX, liqqY, pipe)) {
          if (!gameOver) {
            setGameOver(true);
            onGameOver();
            triggerHapticFeedback(HAPTIC_PATTERNS.gameOver);
          }
          return;
        }

        // Score check
        if (!pipe.scored && liqqX > pipe.x + PIPE_WIDTH/2) {
          const newScore = score + 1;
          setScore(newScore);
          onScoreChange(newScore);
          pipe.scored = true;
          triggerHapticFeedback(HAPTIC_PATTERNS.score);
        }
      }
    }

    // Update pipes with delta time
    movePipes(delta);
  });

  // Memoize scene elements
  const lights = useMemo(() => (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </>
  ), []);

  const pipeElements = useMemo(() => (
    pipes.map(pipe => (
      <group key={pipe.id}>
        <TopPipe x={pipe.x} gapY={pipe.gapY} />
        <BottomPipe x={pipe.x} gapY={pipe.gapY} />
      </group>
    ))
  ), [pipes]);

  return (
    <>
      {lights}
      <Liqq ref={liqqRef} position={[0, 0, 0]} />
      {pipeElements}
    </>
  );
}
