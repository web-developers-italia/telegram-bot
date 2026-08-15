import { fmt, FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import type { Message } from "grammy/types";
import { defineCommand, type Command } from "../CommandsProtocol.js";
import { MissingReply } from "../errors.js";
import { TelegramCtx } from "../TelegramCtx.js";
import { sendRules } from "./rules.js";

const mentionAuthor = (target: Message) => {
	const author = target.from;
	if (author?.username) return `@${author.username}`;

	return FormattedString.mentionUser(
		author?.first_name ?? target.sender_chat?.title ?? "utente",
		author?.id ?? target.sender_chat?.id ?? 0,
	);
};

const sendRielabora = Effect.gen(function* () {
	const telegram = yield* TelegramCtx;
	const target = telegram.message?.reply_to_message;
	if (!target) return yield* Effect.fail(new MissingReply());

	const rulesMessage = yield* sendRules;
	yield* telegram.deleteMessage(target.message_id);

	const mention = mentionAuthor(target);
	yield* telegram.reply(
		fmt`${mention} leggi le regole e poi rielabora la tua domanda per favore`,
		{ replyTo: rulesMessage.message_id, disablePreview: true },
	);
});

export const rielabora: Command = defineCommand(
	["/rielabora"],
	sendRielabora,
	"in reply: cancella il messaggio quotato e invita a rileggere le regole",
);
