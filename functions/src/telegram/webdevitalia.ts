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

const insiemeBot: Telegraf<Context> = new Telegraf(
  process.env.TELEGRAM_BOT_KEY
);

insiemeBot.hears(["@admin", "/admin"], admin);

insiemeBot.hears(["/regolamento", "/regole", "/rules"], rules);

insiemeBot.hears(["/contribute", "/contribuisci"], contribute);

insiemeBot.hears(["/dontasktoask", "/nonchiederedichiedere"], dontasktoask);

insiemeBot.hears(["/rielabora"], rielabora);

insiemeBot.hears(["/learn"], learn);

export const bot = functions
  .region("europe-west1")
  .https.onRequest((req, res) => {
    insiemeBot.handleUpdate(req.body, res);
    res.sendStatus(200);
  });
