import type { Context } from "telegraf";
import { escapeForTelegram } from "../utils";

export const middleware = (context: Context) => {
	const messageReplyTarget =
		// @ts-ignore - reply_to_message exists but telegraf typings are flawed
		context.message?.reply_to_message?.message_id ??
		context.message?.message_id;

	const reply: string = `
Sei nuovo nel mondo del Web development?
- https://roadmap.sh/
- http://jsforcats.com/
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- https://github.com/getify/You-Dont-Know-JS
- https://github.com/EbookFoundation/free-programming-books

Piattaforme di e-learning:
- https://www.freecodecamp.org/
- https://www.codecademy.com/
- https://www.codewars.com/
`;

	return context.reply(escapeForTelegram(reply), {
		reply_to_message_id: messageReplyTarget,
		parse_mode: "MarkdownV2",
		disable_web_page_preview: true,
	});
};

export const triggers = ["/learn"];
