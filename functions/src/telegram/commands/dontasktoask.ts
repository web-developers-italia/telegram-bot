import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";
import type { CommandsProtocol } from "../CommandsProtocol";

export const dontasktoask: CommandsProtocol<Message> = function (context: Context) {
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
}

dontasktoask.triggers = ["/dontasktoask", "/nonchiederedichiedere"];