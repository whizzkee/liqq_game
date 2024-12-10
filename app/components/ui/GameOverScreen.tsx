interface GameOverScreenProps {
  score: number;
  onStart: () => void;
}

export function GameOverScreen({ score, onStart }: GameOverScreenProps) {
  return (
    <div className="center-content" onClick={onStart}>
      {score > 0 ? (
        <div className="text-center text-white">
          <div className="text-6xl font-bold mb-4">Game Over!</div>
          <div className="text-4xl">Score: {score}</div>
          <div className="text-2xl mt-4 flash-animation">Click to Play Again</div>
        </div>
      ) : (
        <div className="text-center text-white">
          <div className="title">Liqqy Liqq</div>
          <div className="start-text flash-animation">Press to Start</div>
        </div>
      )}
    </div>
  );
}
