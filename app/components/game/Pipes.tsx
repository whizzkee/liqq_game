import { PIPE_WIDTH, PIPE_GAP } from '@/app/constants';

interface PipeProps {
  x: number;
  gapY: number;
}

export function TopPipe({ x, gapY }: PipeProps) {
  const height = 20 - (gapY + PIPE_GAP/2);  // From top of screen to top of gap
  return (
    <mesh position={[x, gapY + PIPE_GAP/2 + height/2, 0]}>
      <boxGeometry args={[PIPE_WIDTH, height, PIPE_WIDTH]} />
      <meshStandardMaterial color="#ff0000" />
    </mesh>
  );
}

export function BottomPipe({ x, gapY }: PipeProps) {
  const height = 20 + (gapY - PIPE_GAP/2);  // From bottom of screen to bottom of gap
  return (
    <mesh position={[x, gapY - PIPE_GAP/2 - height/2, 0]}>
      <boxGeometry args={[PIPE_WIDTH, height, PIPE_WIDTH]} />
      <meshStandardMaterial color="#22c55e" />
    </mesh>
  );
}
