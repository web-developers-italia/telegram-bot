import type { Context } from "telegraf";
import { escapeForTelegram } from "../utils";

export const middleware = (context: Context) => {
	return context.reply(escapeForTelegram(`/pong 🏓`), {
		parse_mode: "MarkdownV2",
		disable_web_page_preview: true,
		reply_to_message_id: context.message?.message_id ?? undefined,
	});
};

export const triggers = ["/ping"];
