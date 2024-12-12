'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('./components/Game'), {
  ssr: false
});

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-bold">Liqq Game</h1>
      <div className="w-full max-w-4xl aspect-video">
        <Game />
      </div>
    </div>
  );
}
