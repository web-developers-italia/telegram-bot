import { fmt, FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import { logger } from "firebase-functions/logger";
import { Members } from "../../services/Members.js";
import { TelegramCtx } from "../TelegramCtx.js";

const hasLink = (message: {
	readonly entities?: readonly { readonly type: string }[];
	readonly caption_entities?: readonly { readonly type: string }[];
}): boolean =>
	[...(message.entities ?? []), ...(message.caption_entities ?? [])].some(
		(entity) => entity.type === "url" || entity.type === "text_link",
	);

// ponytail: euristica a finestra fissa 24h dall'ingresso, niente conteggio
// messaggi; upgrade path: contatore messaggi per utente se servisse più precisione.
export const linkGuard: Effect.Effect<void, never, TelegramCtx | Members> =
	Effect.gen(function* () {
		const telegram = yield* TelegramCtx;
		const message = telegram.message;
		if (!message || !hasLink(message)) return;

		const from = message.from;
		if (!from || from.is_bot) return;

		const members = yield* Members;
		const isRecent = yield* members.isRecentJoiner(from.id);
		if (!isRecent) return;

		yield* telegram.deleteMessage(message.message_id);
		yield* telegram.reply(
			fmt`⚠️ ${FormattedString.mentionUser(from.first_name, from.id)} i link non sono permessi ai nuovi arrivati nelle prime 24 ore.`,
		);
	}).pipe(
		Effect.catchAll((error) =>
			Effect.sync(() => logger.warn("linkGuard failed", error)),
		),
	);
