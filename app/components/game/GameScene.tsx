import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { GRAVITY, HAPTIC_PATTERNS, PIPE_WIDTH, LIQQ_SIZE, PIPE_GAP, GAME_SPEED } from '@/app/constants';
import { GameSceneProps, Pipe } from '@/app/types';
import { Liqq } from './Liqq';
import { TopPipe, BottomPipe } from './Pipes';
import { useGameLogic } from '@/app/hooks/useGameLogic';

export function GameScene({ onScoreChange, started, onGameOver }: GameSceneProps) {
  const liqqRef = useRef<THREE.Mesh>(null);
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

  useFrame((_, delta) => {
    if (!liqqRef.current || !started || gameOver) return;

    // Track frame time for performance optimization
    const now = performance.now();
    frameTimeRef.current = now - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = now;

    // Optimized physics calculations with frame time compensation
    const frameRate = 1 / delta;
    const targetFrameRate = 60;
    const frameRateAdjustment = Math.min(2, Math.max(0.5, targetFrameRate / frameRate));
    
    // Simplified gravity calculation without touch-based adjustment
    const newVelocity = velocity - (GRAVITY * delta * 60 * frameRateAdjustment);
    setVelocity(newVelocity);
    
    const positionDelta = newVelocity * delta * frameRateAdjustment;
    const newY = liqqRef.current.position.y + positionDelta;
    liqqRef.current.position.y = newY;

    // Smoother rotation with touch feedback
    const targetRotation = touchActive ? 
      Math.PI / 6 : // Slight upward rotation when touch is active
      Math.max(Math.min(newVelocity * 0.1, Math.PI / 4), -Math.PI / 4);
    
    liqqRef.current.rotation.z = THREE.MathUtils.lerp(
      liqqRef.current.rotation.z,
      targetRotation,
      delta * 10
    );

    // Check boundary collisions
    if (newY < -10 || newY > 10) {
      if (!gameOver) {
        setGameOver(true);
        onGameOver();
        triggerHapticFeedback(HAPTIC_PATTERNS.gameOver);
      }
      return;
    }

    // Check pipe collisions and scoring
    const liqqX = liqqRef.current.position.x;
    const liqqY = newY;

    for (const pipe of pipes) {
      // Collision detection
      if (Math.abs(liqqX - pipe.x) < (PIPE_WIDTH + LIQQ_SIZE) / 2) {
        if (liqqY + LIQQ_SIZE > pipe.gapY + PIPE_GAP/2 || 
            liqqY - LIQQ_SIZE < pipe.gapY - PIPE_GAP/2) {
          if (!gameOver) {
            setGameOver(true);
            onGameOver();
            triggerHapticFeedback(HAPTIC_PATTERNS.gameOver);
          }
          return;
        }
      }

      // Scoring
      if (!pipe.scored && liqqX > pipe.x + PIPE_WIDTH/2) {
        onScoreChange(prev => prev + 1);
        pipe.scored = true;
        triggerHapticFeedback(HAPTIC_PATTERNS.score);
      }
    }

    // Update pipes
    const currentTime = Date.now();
    if (currentTime - lastUpdateTimeRef.current > 16) {
      setPipes(prevPipes => prevPipes.map(pipe => ({
        ...pipe,
        x: pipe.x - GAME_SPEED
      })).filter(pipe => pipe.x > -10));
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      <Liqq ref={liqqRef} position={[0, 0, 0]} />

      {pipes.map(pipe => (
        <group key={pipe.id}>
          <TopPipe x={pipe.x} gapY={pipe.gapY} />
          <BottomPipe x={pipe.x} gapY={pipe.gapY} />
        </group>
      ))}
    </>
  );
}
