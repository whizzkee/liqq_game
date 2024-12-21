import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import config from '../telegram/config';

const bot = new TelegramBot(config.token);

export async function POST(request: Request) {
  try {
    const update = await request.json();
    
    // Handle callback queries
    if (update.callback_query) {
      const query = update.callback_query;
      if (query.game_short_name === config.gameShortName) {
        await bot.answerCallbackQuery(query.id, {
          url: `${config.gameUrl}?userId=${query.from.id}&chatId=${query.message.chat.id}`,
        });
      }
    }
    
    // Handle /start command
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id;
      await bot.sendMessage(chatId, 'Welcome to the game! Click the button below to start playing:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎮 Play Game', callback_game: {} }]
          ]
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Failed to handle webhook' }, { status: 500 });
  }
}
