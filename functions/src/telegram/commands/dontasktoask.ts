import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";
import type { CommandsProtocol } from "../CommandsProtocol";
import { escapeForTelegram } from "../utils";

export const dontasktoask: CommandsProtocol<Message> = function (
	context: Context,
) {
	const messageReplyTarget =
		// @ts-ignore - reply_to_message exists but telegraf typings are flawed
		context.message?.reply_to_message?.message_id ??
		context.message?.message_id;

	const reply: string = `
Leggi questo per favore e poi rielabora la tua domanda:
🇮🇹 https://nonchiederedichiedere.com
🇺🇸 https://dontasktoask.com
`;

	return context.reply(escapeForTelegram(reply), {
		reply_to_message_id: messageReplyTarget,
		parse_mode: "MarkdownV2",
		disable_web_page_preview: true,
	});
};

dontasktoask.triggers = ["/dontasktoask", "/nonchiederedichiedere"];
