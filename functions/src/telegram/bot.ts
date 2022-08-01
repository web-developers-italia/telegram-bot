import * as functions from "firebase-functions";
import { Telegraf, Context } from "telegraf";
import { rules } from "./commands/rules";
import { rielabora } from "./commands/rielabora";
import { contribute } from "./commands/contribute";
import { admin } from "./commands/admin";
import { dontasktoask } from "./commands/dontasktoask";
import { learn } from "./commands/learn";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_BOT_KEY: string;
    }
  }
}

const telegramBot: Telegraf<Context> = new Telegraf(
  process.env.TELEGRAM_BOT_KEY
);

telegramBot.hears(["@admin", "/admin"], admin);

telegramBot.hears(["/regolamento", "/regole", "/rules"], rules);

telegramBot.hears(["/contribute", "/contribuisci"], contribute);

telegramBot.hears(["/dontasktoask", "/nonchiederedichiedere"], dontasktoask);

telegramBot.hears(["/rielabora"], rielabora);

telegramBot.hears(["/learn"], learn);

export const bot = functions
  .region("europe-west1")
  .https.onRequest((req, res) => {
    telegramBot.handleUpdate(req.body, res);
    res.sendStatus(200);
  });
