import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";
import type { CommandsProtocol } from "../CommandsProtocol";

export const admin: CommandsProtocol<Message> = async function (context: Context) {
  const admins = await context.getChatAdministrators();

  const nicks = admins.map((a) => `@${a.user.username}`).join(" ");

  return context.reply(nicks, {
    parse_mode: "MarkdownV2",
    reply_to_message_id: context.message
      ? context.message.message_id
      : undefined,
  });
}

admin.triggers = ["@admin", "/admin"];