// Client-side telegram interface
interface InlineKeyboardButton {
  text: string;
  callback_game?: Record<string, never>;
  url?: string;
}

interface ReplyMarkup {
  inline_keyboard?: InlineKeyboardButton[][];
}

interface SendMessageOptions {
  reply_markup?: ReplyMarkup;
}

interface TelegramApi {
  sendMessage: (chatId: number, message: string, options?: SendMessageOptions) => Promise<void>;
}

const createTelegramApi = (): TelegramApi => {
  return {
    sendMessage: async (chatId: number, message: string, options?: SendMessageOptions) => {
      const response = await fetch('/api/telegram/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, message, options }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    },
  };
};

export const telegram = createTelegramApi();
