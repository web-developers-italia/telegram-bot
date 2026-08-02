import { fmt, FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import { defineCommand, type Command } from "../CommandsProtocol.js";
import { NotAGroup } from "../errors.js";
import { TelegramCtx } from "../TelegramCtx.js";

const isGroupChat = (chatType: string | undefined): boolean =>
	chatType === "group" || chatType === "supergroup";

const notifyAdmins = Effect.gen(function* () {
	const telegram = yield* TelegramCtx;

	if (!isGroupChat(telegram.chatType))
		return yield* Effect.fail(new NotAGroup());

	const admins = yield* telegram.getChatAdministrators();
	const mentions = admins
		.filter((admin) => !admin.user.is_bot)
		.map((admin) => FormattedString.mentionUser(" ", admin.user.id));

	yield* telegram.reply(
		fmt`Gli amministratori sono stati notificati.${FormattedString.join(mentions)}`,
		{ replyTo: telegram.message?.message_id },
	);
});

export const admin: Command = defineCommand(["@admin", "/admin"], notifyAdmins);
