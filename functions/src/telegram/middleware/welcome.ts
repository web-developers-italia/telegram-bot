import { fmt, FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import { logger } from "firebase-functions/logger";
import type { ChatMemberUpdated } from "grammy/types";
import { Members } from "../../services/Members.js";
import { TelegramCtx } from "../TelegramCtx.js";

const WELCOME_COOLDOWN_MS = 60_000;

const isNewJoin = (cmu: ChatMemberUpdated): boolean =>
	(cmu.old_chat_member.status === "left" ||
		cmu.old_chat_member.status === "kicked") &&
	cmu.new_chat_member.status === "member";

/**
 * Gira sull'update chat_member: manda un benvenuto al nuovo membro e registra
 * l'ingresso per l'euristica anti-spam di linkGuard. Cap anti mass-join: se un
 * benvenuto è già stato mandato negli ultimi 60s, il vecchio viene comunque
 * cancellato ma non se ne manda uno nuovo.
 */
export const welcome: Effect.Effect<void, never, TelegramCtx | Members> =
	Effect.gen(function* () {
		const telegram = yield* TelegramCtx;
		const cmu = telegram.chatMemberUpdate;
		if (!cmu || !isNewJoin(cmu)) return;

		const members = yield* Members;
		const user = cmu.new_chat_member.user;
		const chatId = cmu.chat.id;

		yield* members.recordJoin(user.id);

		const state = yield* members.welcomeState(chatId);
		if (state) {
			yield* telegram
				.deleteMessage(state.messageId)
				.pipe(
					Effect.catchAll((error) =>
						Effect.sync(() => logger.warn("welcome cleanup failed", error)),
					),
				);
		}

		if (state && Date.now() - state.sentAtMs < WELCOME_COOLDOWN_MS) return;

		const sent = yield* telegram.reply(
			fmt`Benvenuto/a ${FormattedString.mentionUser(user.first_name, user.id)} in Web Developers Italia! 👋
Dai un'occhiata al regolamento con /regole e presentati pure.`,
		);

		yield* members.setWelcomeState(chatId, {
			messageId: sent.message_id,
			sentAtMs: Date.now(),
		});
	}).pipe(
		Effect.catchAll((error) =>
			Effect.sync(() => logger.error("welcome failed", error)),
		),
	);
