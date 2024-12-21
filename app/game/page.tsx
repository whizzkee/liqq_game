'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { default as DynamicImport } from 'next/dynamic';

interface TelegramWebApp {
  ready: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

const GameComponent = DynamicImport(() => import('../components/Game'), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center bg-black">Loading game...</div>
});

function GameWithParams() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const chatId = searchParams.get('chatId');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <GameComponent userId={userId} chatId={chatId} />
    </div>
  );
}

export default GameWithParams;

// Disable static generation for this page
export const dynamic = 'force-dynamic';
