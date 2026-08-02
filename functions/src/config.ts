import { defineSecret } from "firebase-functions/params";

export const TELEGRAM_BOT_KEY = defineSecret("TELEGRAM_BOT_KEY");
export const TELEGRAM_WEBHOOK_SECRET = defineSecret("TELEGRAM_WEBHOOK_SECRET");
