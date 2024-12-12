'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  private block!: Phaser.GameObjects.Rectangle & Phaser.GameObjects.Components.Transform;
  private jumpVelocity: number = -400;
  private gravity: number = 800;
  private blockVelocityY: number = 0;

  constructor() {
    super({ key: 'MainScene' });
    // Bind the jump method to maintain correct 'this' context
    this.jump = this.jump.bind(this);
  }

  create() {
    const { width, height } = this.scale;
    // Create a rectangle as our block
    this.block = this.add.rectangle(width / 2, height / 2, 50, 50, 0x00ff00);

    // Add keyboard input
    this.input!.keyboard!.on('keydown-SPACE', this.jump, this);

    // Add touch/mouse input
    this.input!.on('pointerdown', this.jump, this);
  }

  jump() {
    this.blockVelocityY = this.jumpVelocity;
  }

  update(time: number, delta: number) {
    const { height } = this.scale;
    // Apply gravity
    this.blockVelocityY += this.gravity * (delta / 1000);
    this.block.y += this.blockVelocityY * (delta / 1000);

    // Keep block within screen bounds
    if (this.block.y > height * 0.75) {
      this.block.y = height * 0.75;
      this.blockVelocityY = 0;
    }
  }
}

export default function Game() {
  const gameRef = useRef<HTMLDivElement>(null);
  const game = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current && !game.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 360,
          height: 640,
          zoom: 1
        },
        backgroundColor: '#000000',
        scene: MainScene,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        }
      };

      game.current = new Phaser.Game(config);
    }

    return () => {
      game.current?.destroy(true);
      game.current = null;
    };
  }, []);

  return (
    <div 
      ref={gameRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        touchAction: 'none',
        overflow: 'hidden',
        backgroundColor: '#000000',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }} 
    />
  );
}
