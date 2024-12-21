const config = {
  token: process.env.TELEGRAM_BOT_TOKEN || '',
  gameShortName: process.env.TELEGRAM_GAME_SHORT_NAME || '',
  gameUrl: process.env.NEXT_PUBLIC_GAME_URL || 'http://localhost:3000/game',
  webhookUrl: process.env.WEBHOOK_URL || '',
  isDevelopment: process.env.NODE_ENV === 'development',
};

export default config;
