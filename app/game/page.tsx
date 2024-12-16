'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Game from '../components/Game';

export default function GamePage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const chatId = searchParams.get('chatId');

  // Initialize Telegram game SDK
  useEffect(() => {
    // @ts-expect-error - Telegram WebApp types
    if (window.Telegram?.WebApp) {
      // @ts-expect-error - Telegram WebApp types
      window.Telegram.WebApp.ready();
    }
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <Game userId={userId} chatId={chatId} />
    </div>
  );
}
