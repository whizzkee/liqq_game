'use client';

import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

export class MainScene extends Phaser.Scene {
  private block!: Phaser.GameObjects.Rectangle & Phaser.GameObjects.Components.Transform;
  private background!: Phaser.GameObjects.TileSprite;
  private bottomCandles: Phaser.GameObjects.Rectangle[] = [];
  private topCandles: Phaser.GameObjects.Rectangle[] = [];
  private nextCandleTime: number = 0;
  private candleSpawnInterval: number = GAME_CONFIG.CANDLE_SPAWN_INTERVAL;
  private flyForce: number = GAME_CONFIG.FLY_FORCE;
  private gravity: number = GAME_CONFIG.GRAVITY;
  private blockVelocityY: number = 0;
  private moveSpeed: number = GAME_CONFIG.MOVE_SPEED;
  private gameStarted: boolean = false;
  private startText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private score: number = 0;
  private hoverOffset: number = 0;
  private isFlying: boolean = false;

  constructor() {
    super({ key: 'MainScene' });
    this.fly = this.fly.bind(this);
    this.stopFlying = this.stopFlying.bind(this);
  }

  create() {
    this.createBackground();
    this.createBlock();
    this.createBoundaries();
    this.createUI();
    this.setupInputHandlers();
  }

  private createBackground() {
    const { width, height } = this.scale;
    this.createGradientTexture();
    this.background = this.add.tileSprite(0, 0, width, height, 'gradient');
    this.background.setOrigin(0, 0);
  }

  private createBlock() {
    const { width, height } = this.scale;
    const groundY = height * GAME_CONFIG.GROUND_LEVEL;
    this.block = this.add.rectangle(
      width * 0.3,
      groundY - 200,
      GAME_CONFIG.BLOCK_SIZE,
      GAME_CONFIG.BLOCK_SIZE,
      0x00bfff
    );
  }

  private createBoundaries() {
    const { width, height } = this.scale;
    const groundY = height * GAME_CONFIG.GROUND_LEVEL;
    
    const ground = this.add.rectangle(width / 2, groundY, width, 2, 0x666666);
    ground.setOrigin(0.5, 0);
    
    const ceiling = this.add.rectangle(
      width / 2,
      height * GAME_CONFIG.CEILING_LEVEL,
      width,
      2,
      0x666666
    );
    ceiling.setOrigin(0.5, 1);
  }

  private createUI() {
    const { width, height } = this.scale;
    
    this.scoreText = this.add.text(width / 2, height * 0.1, '0', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.scoreText.setDepth(1);

    this.startText = this.add.text(width / 2, height * 0.4, 'Press Space\nor Tap to Start', {
      fontSize: Math.min(width * 0.08, 32) + 'px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);
  }

  private setupInputHandlers() {
    this.input!.keyboard!.on('keydown-SPACE', this.fly, this);
    this.input!.keyboard!.on('keyup-SPACE', this.stopFlying, this);
    this.input!.on('pointerdown', this.fly, this);
    this.input!.on('pointerup', this.stopFlying, this);
  }

  private createGradientTexture() {
    const width = 256;
    const height = 256;
    const textureKey = 'gradient';

    if (!this.textures.exists(textureKey)) {
      const canvas = this.textures.createCanvas(textureKey, width, height);
      if (!canvas) {
        console.error('Failed to create canvas');
        return;
      }
      const context = canvas.context;

      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#1a1a1a');
      gradient.addColorStop(0.5, '#2a2a2a');
      gradient.addColorStop(1, '#1a1a1a');

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      canvas.refresh();
    }

    return textureKey;
  }

  spawnCandles() {
    if (!this.gameStarted) return;
    
    const { width, height } = this.scale;
    const groundY = height * GAME_CONFIG.GROUND_LEVEL;
    const ceilingY = height * GAME_CONFIG.CEILING_LEVEL;

    const minGapY = ceilingY + GAME_CONFIG.MIN_GAP_SIZE / 2;
    const maxGapY = groundY - GAME_CONFIG.MIN_GAP_SIZE / 2;
    const gapCenterY = Phaser.Math.Between(
      Math.ceil(minGapY),
      Math.floor(maxGapY)
    );

    const topCandleHeight = (gapCenterY - GAME_CONFIG.MIN_GAP_SIZE / 2) - ceilingY;
    const bottomCandleHeight = groundY - (gapCenterY + GAME_CONFIG.MIN_GAP_SIZE / 2);

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

  private updateScore() {
    this.score += 1;
    this.scoreText.setText(this.score.toString());
  }

  private fly() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.startText.destroy();
      return;
    }
    this.isFlying = true;
  }

  private stopFlying() {
    this.isFlying = false;
  }

  resetGame() {
    const { width, height } = this.scale;
    const groundY = height * GAME_CONFIG.GROUND_LEVEL;

    this.gameStarted = false;
    this.block.y = groundY - 200;
    this.blockVelocityY = 0;
    this.hoverOffset = 0;
    this.isFlying = false;
    this.score = 0;
    this.scoreText.setText('0');

    [...this.bottomCandles, ...this.topCandles].forEach(c => c.destroy());
    this.bottomCandles = [];
    this.topCandles = [];

    this.startText = this.add.text(width / 2, height * 0.4, 'Press Space\nor Tap to Start', {
      fontSize: Math.min(width * 0.08, 32) + 'px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width * 0.8 }
    }).setOrigin(0.5);
  }

  update(time: number, delta: number) {
    const deltaSeconds = delta / 1000;
    const { height } = this.scale;
    const groundY = height * GAME_CONFIG.GROUND_LEVEL;

    if (!this.gameStarted) {
      this.updateHoverAnimation(deltaSeconds, groundY);
      return;
    }

    this.updateGameplay(time, deltaSeconds, groundY, height);
  }

  private updateHoverAnimation(deltaSeconds: number, groundY: number) {
    this.hoverOffset += GAME_CONFIG.HOVER_SPEED * deltaSeconds;
    const hoverY = groundY - 200 + Math.sin(this.hoverOffset) * GAME_CONFIG.HOVER_AMPLITUDE;
    this.block.y = hoverY;
  }

  private updateGameplay(time: number, deltaSeconds: number, groundY: number, height: number) {
    this.background.tilePositionX += this.moveSpeed * deltaSeconds;
    this.updateBlockPhysics(deltaSeconds, groundY, height);
    
    if (this.checkCollisions(deltaSeconds)) return;
    
    this.updateCandleSpawning(time);
  }

  private updateBlockPhysics(deltaSeconds: number, groundY: number, height: number) {
    if (this.isFlying) {
      this.blockVelocityY = this.flyForce;
      this.isFlying = false;
    } else {
      this.blockVelocityY = Math.min(this.blockVelocityY + this.gravity * deltaSeconds, 400);
    }
    
    this.block.y += this.blockVelocityY * deltaSeconds;

    if (this.block.y > groundY - 25) {
      this.block.y = groundY - 25;
      this.blockVelocityY = 0;
    }
    if (this.block.y < height * GAME_CONFIG.CEILING_LEVEL + 25) {
      this.block.y = height * GAME_CONFIG.CEILING_LEVEL + 25;
      this.blockVelocityY = 0;
    }
  }

  private checkCollisions(deltaSeconds: number): boolean {
    let passedCandle = false;

    const updateCandles = (candles: Phaser.GameObjects.Rectangle[]) => {
      for (let i = candles.length - 1; i >= 0; i--) {
        const candle = candles[i];
        const oldX = candle.x;
        candle.x -= this.moveSpeed * deltaSeconds;

        if (oldX > this.block.x && candle.x <= this.block.x) {
          passedCandle = true;
        }

        if (candle.x < -50) {
          candle.destroy();
          candles.splice(i, 1);
          continue;
        }

        const blockBounds = this.block.getBounds();
        const candleBounds = candle.getBounds();
        if (Phaser.Geom.Rectangle.Overlaps(blockBounds, candleBounds)) {
          this.resetGame();
          return true;
        }
      }
      return false;
    };

    if (updateCandles(this.bottomCandles) || updateCandles(this.topCandles)) {
      return true;
    }

    if (passedCandle) {
      this.updateScore();
    }

    return false;
  }

  private updateCandleSpawning(time: number) {
    if (time > this.nextCandleTime) {
      this.spawnCandles();
      this.nextCandleTime = time + this.candleSpawnInterval;
    }
  }
}
