export const telegramConfig = {
  // Replace this with your bot token from BotFather
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  
  // Replace this with your production webhook URL
  webhookUrl: process.env.WEBHOOK_URL || '',
  
  // Port for the webhook server (default: 3000)
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
};
