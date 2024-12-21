import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import config from '../telegram/config';

const bot = new TelegramBot(config.token);

export async function POST(request: Request) {
  try {
    const { score, userId } = await request.json();
    
    // Set the game score
    await bot.setGameScore(userId, score, {
      force: true,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting game score:', error);
    return NextResponse.json({ error: 'Failed to set game score' }, { status: 500 });
  }
}
