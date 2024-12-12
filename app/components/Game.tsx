'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  private block!: Phaser.GameObjects.Rectangle & Phaser.GameObjects.Components.Transform;
  private background!: Phaser.GameObjects.TileSprite;
  private candles: Phaser.GameObjects.Rectangle[] = [];
  private nextCandleTime: number = 0;
  private candleSpawnInterval: number = 2000; // Spawn a new candle every 2 seconds
  private jumpVelocity: number = -400;
  private gravity: number = 800;
  private blockVelocityY: number = 0;
  private moveSpeed: number = 300;
  private gameStarted: boolean = false;
  private startText!: Phaser.GameObjects.Text;
  private hoverOffset: number = 0;
  private readonly HOVER_SPEED: number = 2; // Speed of hover animation
  private readonly HOVER_AMPLITUDE: number = 20; // Height of hover

  constructor() {
    super({ key: 'MainScene' });
    // Bind the jump method to maintain correct 'this' context
    this.jump = this.jump.bind(this);
  }

  create() {
    const { width, height } = this.scale;
    
    // Create repeating gradient background
    this.createGradientTexture();
    this.background = this.add.tileSprite(0, 0, width, height, 'gradient');
    this.background.setOrigin(0, 0);
    
    // Create a rectangle as our block
    this.block = this.add.rectangle(width * 0.3, height * 0.6, 50, 50, 0x00bfff);

    // Add start text
    this.startText = this.add.text(width / 2, height * 0.4, 'Press Space\nor Tap to Start', {
      fontSize: Math.min(width * 0.08, 32) + 'px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);

    // Add keyboard input
    this.input!.keyboard!.on('keydown-SPACE', this.startGame, this);

    // Add touch/mouse input
    this.input!.on('pointerdown', this.startGame, this);
  }

  createGradientTexture() {
    const width = 256;
    const height = 256;
    const textureKey = 'gradient';

    if (!this.textures.exists(textureKey)) {
      // Create canvas for gradient
      const canvas = this.textures.createCanvas(textureKey, width, height);
      if (!canvas) {
        console.error('Failed to create canvas');
        return;
      }
      const context = canvas.context;

      // Create gradient
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#1a1a1a');
      gradient.addColorStop(0.5, '#2a2a2a');
      gradient.addColorStop(1, '#1a1a1a');

      // Fill canvas with gradient
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      canvas.refresh();
    }

    return textureKey;
  }

  startGame() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.startText.destroy();
    } else {
      this.jump();
    }
  }

  spawnCandle() {
    if (!this.gameStarted) return;
    
    const { width, height } = this.scale;
    const candleHeight = Phaser.Math.Between(100, 200); // Random height between 100 and 200
    const candle = this.add.rectangle(
      width + 25, // Start just off the right side of the screen
      height * 0.75 - candleHeight / 2, // Align bottom with ground
      50,
      candleHeight,
      0x00ff00 // Green color
    );
    this.candles.push(candle);
  }

  jump() {
    if (!this.gameStarted) return;
    this.blockVelocityY = this.jumpVelocity;
  }

  update(time: number, delta: number) {
    const deltaSeconds = delta / 1000;
    const { height } = this.scale;

    if (!this.gameStarted) {
      // Hover animation when game hasn't started
      this.hoverOffset += this.HOVER_SPEED * deltaSeconds;
      const hoverY = height * 0.6 + Math.sin(this.hoverOffset) * this.HOVER_AMPLITUDE;
      this.block.y = hoverY;
      return;
    }

    // Scroll background
    this.background.tilePositionX += this.moveSpeed * deltaSeconds;

    // Apply gravity
    this.blockVelocityY += this.gravity * deltaSeconds;
    this.block.y += this.blockVelocityY * deltaSeconds;

    // Keep block within screen bounds
    if (this.block.y > height * 0.75) {
      this.block.y = height * 0.75;
      this.blockVelocityY = 0;
    }

    // Spawn new candles
    if (time > this.nextCandleTime) {
      this.spawnCandle();
      this.nextCandleTime = time + this.candleSpawnInterval;
    }

    // Update candles
    for (let i = this.candles.length - 1; i >= 0; i--) {
      const candle = this.candles[i];
      candle.x -= this.moveSpeed * deltaSeconds;

      // Remove candles that are off screen
      if (candle.x < -50) {
        candle.destroy();
        this.candles.splice(i, 1);
        continue;
      }

      // Check for collision with block
      const blockBounds = this.block.getBounds();
      const candleBounds = candle.getBounds();
      if (Phaser.Geom.Rectangle.Overlaps(blockBounds, candleBounds)) {
        // Reset game
        this.gameStarted = false;
        this.block.y = height * 0.6;
        this.blockVelocityY = 0;
        this.hoverOffset = 0;
        // Remove all candles
        this.candles.forEach(c => c.destroy());
        this.candles = [];
        // Add start text back
        const { width } = this.scale;
        this.startText = this.add.text(width / 2, height * 0.4, 'Press Space\nor Tap to Start', {
          fontSize: Math.min(width * 0.08, 32) + 'px',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5);
      }
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
