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
  const lastUpdateTimeRef = useRef(0);

  // Touch cooldown to prevent rapid-fire touches
  const TOUCH_COOLDOWN = 100; // milliseconds

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

  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastTouchTime < TOUCH_COOLDOWN) return;
      
      if (started && !gameOver) {
        setVelocity(FLAP_FORCE);
        setLastTouchTime(now);
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && started && !gameOver) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastTouchTime < TOUCH_COOLDOWN) return;
        
        setVelocity(FLAP_FORCE);
        setLastTouchTime(now);
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastTouchTime < TOUCH_COOLDOWN) return;
      
      if (started && !gameOver) {
        setVelocity(FLAP_FORCE);
        setLastTouchTime(now);
      }
    };

    window.addEventListener('touchstart', handleTouch, { passive: false });
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
    };
  }, [started, gameOver, lastTouchTime]);

  useFrame((_, delta) => {
    if (!liqqRef.current || !started || gameOver) return;

    // Update liqq physics with smoother delta-time handling
    const frameRate = 1 / delta;
    const targetFrameRate = 60;
    const frameRateAdjustment = targetFrameRate / frameRate;
    
    const newVelocity = velocity - (GRAVITY * delta * 60 * frameRateAdjustment);
    setVelocity(newVelocity);
    
    const newY = liqqRef.current.position.y + (newVelocity * delta * frameRateAdjustment);
    liqqRef.current.position.y = newY;

    // Add slight rotation based on velocity for visual feedback
    liqqRef.current.rotation.z = Math.max(Math.min(newVelocity * 0.1, Math.PI / 4), -Math.PI / 4);

    // Check boundary collisions
    if (newY < -10 || newY > 10) {
      if (!gameOver) {
        setGameOver(true);
        onGameOver();
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
    }, 3000);

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