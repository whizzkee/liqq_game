'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('./components/Game'), {
  ssr: false
});

export default function Home() {
  return (
    <div className="h-[100dvh] w-screen">
      <Game />
    </div>
  );
}
