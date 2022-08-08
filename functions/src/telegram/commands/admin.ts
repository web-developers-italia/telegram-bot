import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";
import type { CommandsProtocol } from "../CommandsProtocol";
import { escapeForTelegram } from "../utils";

export const admin: CommandsProtocol<Message> = async function (
	context: Context,
) {
	const admins = await context.getChatAdministrators();

	const tags = admins.reduce<string[]>((acc, current) => {
		if (current.user.is_bot) {
			return acc;
		}

		return [
			...acc,
			// Invisible character on purpose
			`[ ](tg://user?id=${current.user.id})`,
		];
	}, []);

	return context.reply(
		escapeForTelegram(
			`Gli amministratori sono stati notificati. ${tags.join("")}`,
		),
		{
			parse_mode: "MarkdownV2",
			reply_to_message_id: context.message
				? context.message.message_id
				: undefined,
		},
	);
};

admin.triggers = ["@admin", "/admin"];
