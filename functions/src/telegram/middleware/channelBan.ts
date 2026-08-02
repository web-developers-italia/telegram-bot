import { FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import { logger } from "firebase-functions/logger";
import { TelegramCtx } from "../TelegramCtx.js";

export const channelBan: Effect.Effect<void, never, TelegramCtx> = Effect.gen(
	function* () {
		const telegram = yield* TelegramCtx;
		const message = telegram.message;
		const senderChat = message?.sender_chat;

		if (
			!senderChat ||
			senderChat.type !== "channel" ||
			message?.is_automatic_forward
		) {
			return;
		}

		yield* telegram.banChatSenderChat(senderChat.id);
		yield* telegram.deleteMessage(message.message_id);
		yield* telegram.reply(
			FormattedString.italic(
				"Un messaggio inviato da un canale è stato eliminato per violazione delle regole.",
			),
		);
	},
).pipe(
	Effect.catchAll((error) =>
		Effect.sync(() => logger.error("channelBan failed", error)),
	),
);
