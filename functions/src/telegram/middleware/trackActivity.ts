import { Effect } from "effect";
import { Members } from "../../services/Members.js";
import { TelegramCtx } from "../TelegramCtx.js";

export const trackActivity: Effect.Effect<void, never, TelegramCtx | Members> =
	Effect.gen(function* () {
		const telegram = yield* TelegramCtx;
		const from = telegram.message?.from;
		if (!from) return;

		const members = yield* Members;
		yield* members.touch(from.id, from.username);
	});
