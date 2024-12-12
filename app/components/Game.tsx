'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  private block!: Phaser.GameObjects.Rectangle & Phaser.GameObjects.Components.Transform;
  private isJumping: boolean = false;
  private jumpVelocity: number = -400;
  private gravity: number = 800;
  private blockVelocityY: number = 0;

  constructor() {
    super({ key: 'MainScene' });
    // Bind the jump method to maintain correct 'this' context
    this.jump = this.jump.bind(this);
  }

  create() {
    // Create a rectangle as our block
    this.block = this.add.rectangle(400, 300, 50, 50, 0x00ff00);

    // Add keyboard input
    this.input!.keyboard!.on('keydown-SPACE', this.jump, this);

    // Add touch/mouse input
    this.input!.on('pointerdown', this.jump, this);
  }

  jump() {
    if (!this.isJumping) {
      this.blockVelocityY = this.jumpVelocity;
      this.isJumping = true;
    }
  }

  update(time: number, delta: number) {
    // Apply gravity
    this.blockVelocityY += this.gravity * (delta / 1000);
    this.block.y += this.blockVelocityY * (delta / 1000);

    // Check if block has landed
    if (this.block.y > 300) {
      this.block.y = 300;
      this.blockVelocityY = 0;
      this.isJumping = false;
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
        width: 800,
        height: 600,
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

  return <div ref={gameRef} style={{ width: '100%', height: '100%' }} />;
}
