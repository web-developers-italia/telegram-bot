import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";
import type { CommandsProtocol } from "../CommandsProtocol";
import { escapeForTelegram } from "../utils";

export const pong: CommandsProtocol<Message> = function(context: Context) {
  return context.reply(
    escapeForTelegram(`/pong 🏓`),
    {
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
      reply_to_message_id: context.message?.message_id ?? undefined,
    }
  );
}

pong.triggers = ["/ping"];