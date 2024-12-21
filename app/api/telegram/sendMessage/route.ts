import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN || '';
const bot = new TelegramBot(token);

export async function POST(request: Request) {
  try {
    const { chatId, message, options } = await request.json();
    await bot.sendMessage(chatId, message, options);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending telegram message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
