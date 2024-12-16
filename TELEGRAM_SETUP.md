# Telegram Bot Setup Instructions

## Getting Started

1. Create a new Telegram bot:
   - Open Telegram and search for "@BotFather"
   - Send `/newbot` command
   - Follow the instructions to create your bot
   - Save the API token provided by BotFather

2. Set up environment variables:
   Create a `.env.local` file in your project root with the following:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```

## Development Mode

In development mode, the bot uses polling to receive updates:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your bot in Telegram and send the `/start` command to test it

## Production Mode

For production, you'll need to set up a webhook:

1. Deploy your application
2. Set these additional environment variables:
   ```
   WEBHOOK_URL=https://your-domain.com
   NODE_ENV=production
   ```

## Testing the Bot

1. Send `/start` to your bot
2. Click the "Play Game" button that appears
3. The bot will initialize the game session

## Important Notes

- Keep your bot token secret and never commit it to version control
- In development, the bot uses polling mode
- In production, it uses webhook mode for better performance
- Make sure your production server has HTTPS enabled for webhooks to work
