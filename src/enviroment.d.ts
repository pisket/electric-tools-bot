declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_BOT_TOKEN: string;
      CHAT_ID: number;
      PORT: number;
    }
  }
}

export {}
