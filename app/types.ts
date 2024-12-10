export interface Pipe {
  id: number;
  x: number;
  gapY: number;  // Center position of the gap
  scored?: boolean;
}

export interface GameSceneProps {
  onScoreChange: (score: number) => void;
  started: boolean;
  onGameOver: () => void;
}
