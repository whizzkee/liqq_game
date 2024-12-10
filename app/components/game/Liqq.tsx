import { LIQQ_SIZE } from '@/app/constants';
import { forwardRef } from 'react';
import { Mesh } from 'three';

interface LiqqProps {
  position: [number, number, number];
}

export const Liqq = forwardRef<Mesh, LiqqProps>(({ position }, ref) => {
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[LIQQ_SIZE, 8, 8]} />
      <meshStandardMaterial color="#fbbf24" />
    </mesh>
  );
});
