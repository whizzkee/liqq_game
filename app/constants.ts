// Game object sizes
export const LIQQ_SIZE = 0.5;
export const PIPE_WIDTH = 1;
export const PIPE_GAP = 5;    // Size of gap between top and bottom pipes
export const PIPE_SPACING = 7;

// Game physics
export const GAME_SPEED = 0.05;
export const GRAVITY = 0.25;
export const FLAP_FORCE = 4.5;
export const INITIAL_PIPE_COUNT = 3;

// Performance settings
export const PHYSICS_TIMESTEP = 1000 / 60; // 60 FPS physics update
export const MAX_FRAME_TIME = 100; // Maximum time to process between frames (ms)
export const MIN_FRAME_TIME = 8; // Minimum time between frames (ms)

// Touch settings
export const MIN_TOUCH_INTERVAL = 16; // Minimum time between touch events (ms)
export const TOUCH_MOVE_THRESHOLD = 10; // Pixels of movement allowed before canceling touch

// Haptic feedback patterns (in milliseconds)
export const HAPTIC_PATTERNS = {
  tap: [8], // Shorter tap for better responsiveness
  score: [6, 20, 6], // Quicker double pulse
  gameOver: [15, 30, 45] // Shorter increasing intensity
};
