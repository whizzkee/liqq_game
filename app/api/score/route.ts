import { NextResponse } from 'next/server';
import bot from '../../telegram/bot';

export async function POST(request: Request) {
  try {
    const { userId, chatId, score } = await request.json();
    

    await bot.setGameScore(userId, score, {
      chat_id: chatId,
      force: true // This will update the score even if it's lower than previous
    });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error setting game score:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
