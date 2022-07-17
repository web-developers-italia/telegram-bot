import * as functions from "firebase-functions";
import { Telegraf, Context } from "telegraf";
import { sendRules } from "./commands/sendRules";
import type { Message } from "telegraf/typings/core/types/typegram";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_BOT_KEY: string;
    }
  }
}

const bot: Telegraf<Context> = new Telegraf(process.env.TELEGRAM_BOT_KEY);

// Admin alias
bot.hears("@admin", async (context: Context) => {
  const admins = await context.getChatAdministrators();

  const nicks = admins.map((a) => `@${a.user.username}`).join(" ");

  context.reply(nicks, {
    parse_mode: "MarkdownV2",
    reply_to_message_id: context.message
      ? context.message.message_id
      : undefined,
  });
});

// rules
bot.hears(["/regolamento", "/regole", "/rules"], (context: Context) =>
  sendRules(context, context.message?.message_id)
);

// contribute
bot.hears(["/contribute"], (context: Context) => {
  return context.reply(
    `Contribuisci al gruppo: https://github\\.com/insieme-dev/community`,
    {
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
      reply_to_message_id: context.message?.message_id ?? undefined,
    }
  );
});

bot.hears(["/dontasktoask", "/nonchiederedichiedere"], (context: Context) => {
  const messageReplyTarget =
    // @ts-ignore - reply_to_message exists but telegraf typings are flawed
    context.message?.reply_to_message?.message_id ??
    context.message?.message_id;

  return context.reply(
    `
Leggi questo per favore e poi rielabora la tua domanda:
  🇮🇹 https://nonchiederedichiedere\\.com
  🇺🇸 https://dontasktoask\\.com
`,
    {
      reply_to_message_id: messageReplyTarget,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }
  );
});

bot.hears(["/rielabora"], async (context: Context) => {
  console.log("RIELABORA", context);

  const { message_id, from } =
    // @ts-ignore - reply_to_message exists but telegraf typings are flawed
    (context.message?.reply_to_message ?? context.message ?? {}) as Message;

  if (from && message_id) {
    const rulesMessage = await sendRules(context);
    await context.deleteMessage(message_id);

    const mention = from.username
      ? `@${from.username}`
      : `[${from.first_name}](tg://user?id=${from.id})`;

    return context.reply(
      `${mention} leggi le regole e poi rielabora la tua domanda per favore`,
      {
        disable_web_page_preview: true,
        parse_mode: "MarkdownV2",
        reply_to_message_id: rulesMessage.message_id,
      }
    );
  } else {
    return context;
  }
});

export default functions.region("europe-west1").https.onRequest((req, res) => {
  bot.handleUpdate(req.body, res);
  res.sendStatus(200);
});
