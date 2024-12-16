'use client';

import { useEffect } from 'react';
import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  private block!: Phaser.GameObjects.Rectangle & Phaser.GameObjects.Components.Transform;
  private background!: Phaser.GameObjects.TileSprite;
  private bottomCandles: Phaser.GameObjects.Rectangle[] = [];
  private topCandles: Phaser.GameObjects.Rectangle[] = [];
  private nextCandleTime: number = 0;
  private candleSpawnInterval: number = 3000;
  private flyForce: number = -350; // Moderate upward force for controlled flaps
  private gravity: number = 900; // Stronger gravity for more natural falling
  private blockVelocityY: number = 0;
  private moveSpeed: number = 200;
  private gameStarted: boolean = false;
  private startText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private score: number = 0;
  private hoverOffset: number = 0;
  private readonly HOVER_SPEED: number = 2;
  private readonly HOVER_AMPLITUDE: number = 20;
  private readonly GROUND_LEVEL: number = 0.85;
  private readonly CEILING_LEVEL: number = 0.05;
  private readonly BLOCK_SIZE: number = 50;
  private readonly MIN_GAP_SIZE: number = 180;
  private isFlying: boolean = false;
  private userId?: string | null;
  private chatId?: string | null;

  constructor(userId?: string | null, chatId?: string | null) {
    super({ key: 'MainScene' });
    this.userId = userId;
    this.chatId = chatId;
    this.fly = this.fly.bind(this);
    this.stopFlying = this.stopFlying.bind(this);
  }

  init() {
  }

  create() {
    const { width, height } = this.scale;
    
    // Create repeating gradient background
    this.createGradientTexture();
    this.background = this.add.tileSprite(0, 0, width, height, 'gradient');
    this.background.setOrigin(0, 0);
    
    // Create a rectangle as our block
    const groundY = height * this.GROUND_LEVEL;
    this.block = this.add.rectangle(width * 0.3, groundY - 200, this.BLOCK_SIZE, this.BLOCK_SIZE, 0x00bfff);

    // Draw ground and ceiling lines
    const ground = this.add.rectangle(width / 2, groundY, width, 2, 0x666666);
    ground.setOrigin(0.5, 0);
    const ceiling = this.add.rectangle(width / 2, height * this.CEILING_LEVEL, width, 2, 0x666666);
    ceiling.setOrigin(0.5, 1);

    // Add score text
    this.scoreText = this.add.text(width / 2, height * 0.1, '0', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.scoreText.setDepth(1); // Ensure score stays on top

    // Add start text
    this.startText = this.add.text(width / 2, height * 0.4, 'Press Space\nor Tap to Start', {
      fontSize: Math.min(width * 0.08, 32) + 'px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);

    // Add keyboard input for flying
    this.input!.keyboard!.on('keydown-SPACE', this.fly, this);
    this.input!.keyboard!.on('keyup-SPACE', this.stopFlying, this);

    // Add touch/mouse input for flying
    this.input!.on('pointerdown', this.fly, this);
    this.input!.on('pointerup', this.stopFlying, this);
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

  spawnCandles() {
    if (!this.gameStarted) return;
    
    const { width, height } = this.scale;
    const groundY = height * this.GROUND_LEVEL;
    const ceilingY = height * this.CEILING_LEVEL;

    // Calculate random gap position and ensure it's within bounds
    const minGapY = ceilingY + this.MIN_GAP_SIZE / 2;
    const maxGapY = groundY - this.MIN_GAP_SIZE / 2;
    const gapCenterY = Phaser.Math.Between(
      Math.ceil(minGapY),
      Math.floor(maxGapY)
    );

    // Create candles with guaranteed gap
    const topCandleHeight = (gapCenterY - this.MIN_GAP_SIZE / 2) - ceilingY;
    const bottomCandleHeight = groundY - (gapCenterY + this.MIN_GAP_SIZE / 2);

    // Spawn bottom (green) candle if it has height
    if (bottomCandleHeight > 0) {
      const bottomCandle = this.add.rectangle(
        width + 25,
        groundY - bottomCandleHeight / 2,
        50,
        bottomCandleHeight,
        0x00ff00
      );
      this.bottomCandles.push(bottomCandle);
    }

    // Spawn top (red) candle if it has height
    if (topCandleHeight > 0) {
      const topCandle = this.add.rectangle(
        width + 25,
        ceilingY + topCandleHeight / 2,
        50,
        topCandleHeight,
        0xff0000
      );
      this.topCandles.push(topCandle);
    }
  }

  updateScore() {
    this.score += 1;
    this.scoreText.setText(this.score.toString());
  }

  fly() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.startText.destroy();
      return;
    }
    this.isFlying = true;
  }

  stopFlying() {
    this.isFlying = false;
  }

  resetGame() {
    const { width, height } = this.scale;
    const groundY = height * this.GROUND_LEVEL;

    this.gameStarted = false;
    this.block.y = groundY - 200;
    this.blockVelocityY = 0;
    this.hoverOffset = 0;
    this.isFlying = false;
    this.score = 0;
    this.scoreText.setText('0');

    // Remove all candles
    [...this.bottomCandles, ...this.topCandles].forEach(c => c.destroy());
    this.bottomCandles = [];
    this.topCandles = [];

    // Add start text back
    this.startText = this.add.text(width / 2, height * 0.4, 'Press Space\nor Tap to Start', {
      fontSize: Math.min(width * 0.08, 32) + 'px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);
  }

  handleGameOver() {
    if (this.userId && this.chatId) {
      // @ts-expect-error - Telegram WebApp types
      if (window.Telegram?.WebApp) {
        // Send the score to Telegram
        fetch('/api/score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: this.userId,
            chatId: this.chatId,
            score: this.score
          })
        }).catch(console.error);
      }
    }
    
    // Reset game state
    this.gameStarted = false;
    this.score = 0;
    this.block.setPosition(180, 320);
    this.blockVelocityY = 0;
    this.startText.setVisible(true);
    this.updateScore();
  }

  update(time: number, delta: number) {
    const deltaSeconds = delta / 1000;
    const { height } = this.scale;
    const groundY = height * this.GROUND_LEVEL;

    if (!this.gameStarted) {
      // Hover animation when game hasn't started
      this.hoverOffset += this.HOVER_SPEED * deltaSeconds;
      const hoverY = groundY - 200 + Math.sin(this.hoverOffset) * this.HOVER_AMPLITUDE;
      this.block.y = hoverY;
      return;
    }

    // Scroll background
    this.background.tilePositionX += this.moveSpeed * deltaSeconds;

    // Apply flying force and gravity
    if (this.isFlying) {
      // Quick flap upward
      this.blockVelocityY = this.flyForce;
      this.isFlying = false; // Reset flying state immediately for "flap" effect
    } else {
      // Natural falling with speed limit
      this.blockVelocityY = Math.min(this.blockVelocityY + this.gravity * deltaSeconds, 400);
    }
    
    // Apply velocity
    this.block.y += this.blockVelocityY * deltaSeconds;

    // Keep block within screen bounds
    if (this.block.y > groundY - 25) {
      this.block.y = groundY - 25;
      this.blockVelocityY = 0;
    }
    if (this.block.y < height * this.CEILING_LEVEL + 25) {
      this.block.y = height * this.CEILING_LEVEL + 25;
      this.blockVelocityY = 0;
    }

    // Track if we've passed any candles this frame
    let passedCandle = false;

    // Update all candles
    const updateCandles = (candles: Phaser.GameObjects.Rectangle[]) => {
      for (let i = candles.length - 1; i >= 0; i--) {
        const candle = candles[i];
        const oldX = candle.x;
        candle.x -= this.moveSpeed * deltaSeconds;

        // Check if we've passed this candle
        if (oldX > this.block.x && candle.x <= this.block.x) {
          passedCandle = true;
        }

        // Remove candles that are off screen
        if (candle.x < -50) {
          candle.destroy();
          candles.splice(i, 1);
          continue;
        }

        // Check for collision with block
        const blockBounds = this.block.getBounds();
        const candleBounds = candle.getBounds();
        if (Phaser.Geom.Rectangle.Overlaps(blockBounds, candleBounds)) {
          this.handleGameOver();
          return true; // Collision occurred
        }
      }
      return false;
    };

    // Update both sets of candles
    if (updateCandles(this.bottomCandles) || updateCandles(this.topCandles)) {
      return; // Stop updating if collision occurred
    }

    // If we passed a candle pair, update the score
    if (passedCandle) {
      this.updateScore();
    }

    // Spawn new candles
    if (time > this.nextCandleTime) {
      this.spawnCandles();
      this.nextCandleTime = time + this.candleSpawnInterval;
    }
  }
}

interface GameProps {
  userId?: string | null;
  chatId?: string | null;
}

export default function Game({ userId, chatId }: GameProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 800,
      height: 600,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
        zoom: 1
      },
      backgroundColor: '#000000',
      scene: new MainScene(userId, chatId),
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      }
    };

    const gameInstance = new Phaser.Game(config);

    return () => {
      gameInstance.destroy(true);
    };
  }, [userId, chatId]);

  return (
    <div id="game-container" className="w-full h-full" />
  );
}
