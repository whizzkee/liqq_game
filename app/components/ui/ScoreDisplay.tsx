interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <div className="score-display text-white text-2xl font-bold">
      Score: {score}
    </div>
  );
}
