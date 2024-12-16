export const GAME_CONFIG = {
  // Physics
  FLY_FORCE: -350,
  GRAVITY: 900,
  MOVE_SPEED: 200,

  // Game boundaries
  GROUND_LEVEL: 0.85,
  CEILING_LEVEL: 0.05,
  
  // Block properties
  BLOCK_SIZE: 50,
  
  // Candle properties
  MIN_GAP_SIZE: 180,
  CANDLE_SPAWN_INTERVAL: 3000,
  
  // Animation
  HOVER_SPEED: 2,
  HOVER_AMPLITUDE: 20,
  
  // Display
  GAME_WIDTH: 360,
  GAME_HEIGHT: 640,
  
  // Colors
  BLOCK_COLOR: 0x00bfff,
  BOTTOM_CANDLE_COLOR: 0x00ff00,
  TOP_CANDLE_COLOR: 0xff0000,
  BOUNDARY_COLOR: 0x666666,
  BACKGROUND_GRADIENT: {
    START: '#1a1a1a',
    MIDDLE: '#2a2a2a',
    END: '#1a1a1a'
  }
} as const;
