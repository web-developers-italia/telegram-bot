import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";
import { escapeForTelegram } from "../utils";

export async function admin(context: Context): Promise<Message> {
  const admins = await context.getChatAdministrators();

  const nicks = admins.map((a) => `@${a.user.username}`).join(" ");

  return context.reply(escapeForTelegram(nicks), {
    parse_mode: "MarkdownV2",
    reply_to_message_id: context.message
      ? context.message.message_id
      : undefined,
  });
}
