'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Pipe {
  id: number;
  x: number;
  gapY: number;  // Center position of the gap
  scored?: boolean;
}

const LIQQ_SIZE = 0.5;
const PIPE_WIDTH = 1;
const PIPE_GAP = 5;    // Size of gap between top and bottom pipes
const PIPE_SPACING = 7;
const GAME_SPEED = 0.05;
const GRAVITY = 0.25;  // Reduced from 0.3
const FLAP_FORCE = 4.5;  // Adjusted for smoother movement
const INITIAL_PIPE_COUNT = 3;

function Liqq({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[LIQQ_SIZE, 8, 8]} />
      <meshStandardMaterial color="#fbbf24" />
    </mesh>
  );
}

// TopPipe and BottomPipe are separate components for clarity
function TopPipe({ x, gapY }: { x: number; gapY: number }) {
  const height = 20 - (gapY + PIPE_GAP/2);  // From top of screen to top of gap
  return (
    <mesh position={[x, gapY + PIPE_GAP/2 + height/2, 0]}>
      <boxGeometry args={[PIPE_WIDTH, height, PIPE_WIDTH]} />
      <meshStandardMaterial color="#ff0000" />
    </mesh>
  );
}

function BottomPipe({ x, gapY }: { x: number; gapY: number }) {
  const height = 20 + (gapY - PIPE_GAP/2);  // From bottom of screen to bottom of gap
  return (
    <mesh position={[x, gapY - PIPE_GAP/2 - height/2, 0]}>
      <boxGeometry args={[PIPE_WIDTH, height, PIPE_WIDTH]} />
      <meshStandardMaterial color="#22c55e" />
    </mesh>
  );
}

function GameScene({ onScoreChange, started, onGameOver }: { 
  onScoreChange: (score: number) => void, 
  started: boolean,
  onGameOver: () => void 
}) {
  const liqqRef = useRef<THREE.Mesh>(null);
  const [velocity, setVelocity] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const [touchActive, setTouchActive] = useState(false);
  const lastUpdateTimeRef = useRef(0);
  const frameTimeRef = useRef(0);
  const touchPositionRef = useRef({ x: 0, y: 0 });

  // Haptic feedback patterns
  const HAPTIC_PATTERNS = {
    tap: [10], // Short tap
    score: [8, 30, 8], // Double pulse
    gameOver: [20, 40, 60] // Increasing intensity
  };

  const triggerHapticFeedback = (pattern: number[]) => {
    try {
      // Check if vibration is supported
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      // Silently fail if vibration is not supported or fails
      console.debug('Haptic feedback not supported');
    }
  };

  const handleFlap = (e: TouchEvent | MouseEvent | KeyboardEvent) => {
    if (started && !gameOver) {
      // Immediate velocity set for responsive jumps
      setVelocity(FLAP_FORCE);
      setTouchActive(true);
      
      // Trigger haptic feedback for flap
      triggerHapticFeedback(HAPTIC_PATTERNS.tap);
      
      // Reset touch active state after animation frame
      requestAnimationFrame(() => {
        setTouchActive(false);
      });
    }
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length !== 1) return; // Only handle single touches
      
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
        // Trigger game over haptic feedback
        triggerHapticFeedback(HAPTIC_PATTERNS.gameOver);
      }
      return;
    }

    // Check pipe collisions
    for (const pipe of pipes) {
      const liqqX = liqqRef.current.position.x;
      const liqqY = newY;
      
      // Only check collision if liqq is within pipe's x-range
      if (Math.abs(liqqX - pipe.x) < (PIPE_WIDTH + LIQQ_SIZE) / 2) {
        // Check if liqq is outside the gap
        if (liqqY + LIQQ_SIZE > pipe.gapY + PIPE_GAP/2 || 
            liqqY - LIQQ_SIZE < pipe.gapY - PIPE_GAP/2) {
          if (!gameOver) {
            setGameOver(true);
            onGameOver();
            // Trigger game over haptic feedback
            triggerHapticFeedback(HAPTIC_PATTERNS.gameOver);
          }
          return;
        }
      }

      // Score point if passed pipe
      if (!pipe.scored && liqqX > pipe.x + PIPE_WIDTH/2) {
        const newScore = score + 1;
        setScore(newScore);
        onScoreChange(newScore);
        pipe.scored = true;
        // Trigger score haptic feedback
        triggerHapticFeedback(HAPTIC_PATTERNS.score);
      }
    }

    // Update pipes
    const currentTime = Date.now();
    if (currentTime - lastUpdateTimeRef.current > 16) {
      setPipes(prevPipes => {
        const movedPipes = prevPipes.map(pipe => ({
          ...pipe,
          x: pipe.x - GAME_SPEED,
        }));

        // Remove pipes that are off screen and add new ones
        const filteredPipes = movedPipes.filter(pipe => pipe.x > -10);
        while (filteredPipes.length < INITIAL_PIPE_COUNT) {
          const lastPipe = filteredPipes[filteredPipes.length - 1];
          filteredPipes.push(
            generatePipe(lastPipe ? lastPipe.x + PIPE_SPACING : 5)
          );
        }

        return filteredPipes;
      });
      lastUpdateTimeRef.current = currentTime;
    }
  });

  const generatePipe = (x: number) => ({
    id: Math.random(),
    x,
    gapY: Math.random() * 6 - 3,  // Random gap position between -3 and 3
    scored: false
  });

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setVelocity(0);
    if (liqqRef.current) {
      liqqRef.current.position.y = 0;
    }
    const initialPipes = Array.from({ length: INITIAL_PIPE_COUNT }, (_, i) => 
      generatePipe(5 + i * PIPE_SPACING)
    );
    setPipes(initialPipes);
    onScoreChange(0);
  };

  useEffect(() => {
    resetGame();
  }, [started]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* liqq */}
      <mesh ref={liqqRef} position={[0, 0, 0]}>
        <sphereGeometry args={[LIQQ_SIZE, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>

      {/* Pipes */}
      {pipes.map(pipe => (
        <group key={pipe.id}>
          <TopPipe x={pipe.x} gapY={pipe.gapY} />
          <BottomPipe x={pipe.x} gapY={pipe.gapY} />
        </group>
      ))}
    </>
  );
}

export default function Page() {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Hide welcome screen after 3 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setStarted(true);
  };

  const handleGameOver = () => {
    setStarted(false);
  };

  useEffect(() => {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (!started && !showWelcome) {
        handleStart();
      }
    };

    gameContainer.addEventListener('touchstart', handleTouch, { passive: false });

    return () => {
      gameContainer.removeEventListener('touchstart', handleTouch);
    };
  }, [started, showWelcome]);

  return (
    <div id="game-container">
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <color attach="background" args={['#87CEEB']} />
          <fog attach="fog" args={['#87CEEB', 10, 30]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <GameScene 
            onScoreChange={setScore} 
            started={started}
            onGameOver={handleGameOver}
          />
        </Canvas>
      </div>
      
      {/* Welcome Screen - only shows on first load */}
      {showWelcome && (
        <div className="welcome-screen">
          <div className="welcome-text">Welcome to Liqqy Liqq</div>
        </div>
      )}
      
      {/* Game UI Layer */}
      <div className="game-ui">
        {/* Score Display */}
        {started && (
          <div className="score-display text-white text-2xl font-bold">
            Score: {score}
          </div>
        )}
        
        {/* Start/Game Over Screen */}
        {!started && !showWelcome && (
          <div className="center-content" onClick={handleStart}>
            {score > 0 ? (
              // Game Over Screen
              <div className="text-center text-white">
                <div className="text-6xl font-bold mb-4">Game Over!</div>
                <div className="text-4xl">Score: {score}</div>
                <div className="text-2xl mt-4 flash-animation">Click to Play Again</div>
              </div>
            ) : (
              // Start Screen
              <div className="text-center text-white">
                <div className="title">Liqqy Liqq</div>
                <div className="start-text flash-animation">Press to Start</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}