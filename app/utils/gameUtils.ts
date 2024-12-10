import { Pipe } from '../types';

export function generatePipe(x: number): Pipe {
  return {
    id: Math.random(),
    x,
    gapY: Math.random() * 6 - 3,  // Random gap position between -3 and 3
    scored: false
  };
}
