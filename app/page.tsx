'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function JumpingCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isJumping, setIsJumping] = useState(false);
  const [jumpVelocity, setJumpVelocity] = useState(0);
  const baseY = 0;
  const jumpForce = 0.3;
  const gravity = 0.015;
  const hoverAmplitude = 0.1;
  const hoverFrequency = 2;

  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      setJumpVelocity(jumpForce);
    }
  };

  useEffect(() => {
    // Handle keyboard events
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        handleJump();
      }
    };

    // Handle touch events
    const handleTouch = (event: TouchEvent) => {
      event.preventDefault();
      handleJump();
    };

    // Handle mouse events
    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      handleJump();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('click', handleClick);
    };
  }, [isJumping]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (isJumping) {
      meshRef.current.position.y += jumpVelocity;
      setJumpVelocity(prev => prev - gravity);

      if (meshRef.current.position.y <= baseY) {
        meshRef.current.position.y = baseY;
        setIsJumping(false);
        setJumpVelocity(0);
      }
    } else {
      // Hovering animation when not jumping
      meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * hoverFrequency) * hoverAmplitude;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, baseY, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

export default function Page() {
  return (
    <div style={{ width: '100vw', height: '100vh', touchAction: 'none' }}>
      <Canvas 
        style={{ background: '#111' }}
        camera={{ position: [0, 2, 5], fov: 75 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <JumpingCube />
      </Canvas>
    </div>
  );
}