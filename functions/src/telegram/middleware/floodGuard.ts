import { fmt, FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import { logger } from "firebase-functions/logger";
import { TelegramCtx } from "../TelegramCtx.js";

export const FLOOD_WINDOW_MS = 10_000;
export const FLOOD_MAX = 7;
export const WARN_COOLDOWN_MS = 60_000;

// ponytail: stato in-memory per istanza (come il throttle di MembersLive) e
// niente esenzione admin: con più istanze qualche flood sfugge, accettabile;
// upgrade path: contatore condiviso su Firestore.
export const makeFloodGuard = (
	options: { readonly now?: () => number } = {},
): Effect.Effect<void, never, TelegramCtx> => {
	const now = options.now ?? Date.now;
	const timestamps = new Map<number, number[]>();
	const lastWarning = new Map<number, number>();

	return Effect.gen(function* () {
		const telegram = yield* TelegramCtx;
		const message = telegram.message;
		if (!message) return;

		const from = message.from;
		if (!from || from.is_bot) return;
		if (telegram.chatType !== "group" && telegram.chatType !== "supergroup") {
			return;
		}

		const nowMs = now();
		const recent = [...(timestamps.get(from.id) ?? []), nowMs].filter(
			(ts) => nowMs - ts < FLOOD_WINDOW_MS,
		);
		timestamps.set(from.id, recent);
		if (recent.length <= FLOOD_MAX) return;

		yield* telegram.deleteMessage(message.message_id);

		const warnedAt = lastWarning.get(from.id);
		if (warnedAt !== undefined && nowMs - warnedAt < WARN_COOLDOWN_MS) return;

		lastWarning.set(from.id, nowMs);
		yield* telegram.reply(
			fmt`⚠️ ${FormattedString.mentionUser(from.first_name, from.id)} stai inviando troppi messaggi di fila, rallenta un attimo.`,
		);
	}).pipe(
		Effect.catchAll((error) =>
			Effect.sync(() => logger.warn("floodGuard failed", error)),
		),
	);
};
