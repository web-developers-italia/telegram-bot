import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";
import { escapeForTelegram } from "../utils";
import { rules } from "./rules";

export async function rielabora(context: Context): Promise<Message | Context> {
	const { message_id, from } =
		// @ts-ignore - reply_to_message exists but telegraf typings are flawed
		(context.message?.reply_to_message ?? context.message ?? {}) as Message;

	if (from && message_id) {
		const rulesMessage = await rules(context);
		await context.deleteMessage(message_id);

		const mention = from.username
			? `@${from.username}`
			: `[${from.first_name}](tg://user?id=${from.id})`;

		return context.reply(
			escapeForTelegram(
				`${mention} leggi le regole e poi rielabora la tua domanda per favore`,
			),
			{
				disable_web_page_preview: true,
				parse_mode: "MarkdownV2",
				reply_to_message_id: rulesMessage.message_id,
			},
		);
	}

	return context;
}
