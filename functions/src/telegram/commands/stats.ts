import { fmt, FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import { Members } from "../../services/Members.js";
import { isGroupChat } from "../chat.js";
import { defineCommand, type Command } from "../CommandsProtocol.js";
import { NotAdmin, NotAGroup } from "../errors.js";
import { TelegramCtx } from "../TelegramCtx.js";

const sendStats = Effect.gen(function* () {
	const telegram = yield* TelegramCtx;
	const members = yield* Members;

	if (!isGroupChat(telegram.chatType))
		return yield* Effect.fail(new NotAGroup());

	const requesterId = telegram.message?.from?.id;
	const admins = yield* telegram.getChatAdministrators();
	const isAdmin = admins.some((admin) => admin.user.id === requesterId);
	if (!isAdmin) return yield* Effect.fail(new NotAdmin());

	const counts = yield* members.activeCounts();

	yield* telegram.reply(
		fmt`${FormattedString.bold("Attività del gruppo")}

Membri attivi negli ultimi 7 giorni: ${counts.last7}
Membri attivi negli ultimi 30 giorni: ${counts.last30}`,
		{ replyTo: telegram.message?.message_id },
	);
});

export const stats: Command = defineCommand(["/stats"], sendStats);
