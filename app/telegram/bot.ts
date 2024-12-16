import TelegramBot from 'node-telegram-bot-api';

// Replace 'YOUR_BOT_TOKEN' with the token you get from BotFather
const token = process.env.TELEGRAM_BOT_TOKEN || '';
const isDevelopment = process.env.NODE_ENV === 'development';
const gameShortName = process.env.TELEGRAM_GAME_SHORT_NAME || '';
const gameUrl = process.env.NEXT_PUBLIC_GAME_URL || 'http://localhost:3000/game';

let bot: TelegramBot;

if (isDevelopment) {
  // Polling for development
  bot = new TelegramBot(token, { polling: true });
} else {
  // Webhook for production
  const url = process.env.WEBHOOK_URL || '';
  bot = new TelegramBot(token, { webHook: { port: process.env.PORT ? parseInt(process.env.PORT) : 3000 } });
  bot.setWebHook(`${url}/api/webhook`);
}

// Command handlers
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, 'Welcome to the game! Click the button below to start playing:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎮 Play Game', callback_game: {} }]
      ]
    }
  });
});

// Handle callback queries
bot.on('callback_query', async (query) => {
  if (!query.message) return;
  
  if (query.game_short_name === gameShortName) {
    try {
      // Send the game URL to the user
      await bot.answerCallbackQuery(query.id, {
        url: `${gameUrl}?userId=${query.from.id}&chatId=${query.message.chat.id}`,
      });
    } catch (error) {
      console.error('Error sending game URL:', error);
    }
  }
});

// Handle game score updates
bot.on('inline_query', async (query) => {
  try {
    await bot.answerInlineQuery(query.id, [{
      type: 'game',
      id: '1',
      game_short_name: gameShortName,
    }]);
  } catch (error) {
    console.error('Error handling inline query:', error);
  }
});

export default bot;
