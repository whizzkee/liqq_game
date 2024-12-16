'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { MainScene } from '../game/scenes/MainScene';
import { GAME_CONFIG } from '../game/config/gameConfig';

const GameContainer = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const game = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (gameRef.current && !game.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: GAME_CONFIG.GAME_WIDTH,
          height: GAME_CONFIG.GAME_HEIGHT,
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
      className="game-container"
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

export default GameContainer;
