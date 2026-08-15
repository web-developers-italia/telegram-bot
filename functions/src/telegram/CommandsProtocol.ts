import type { FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import type { BotConfig } from "../services/BotConfig.js";
import type { Github } from "../services/Github.js";
import type { Members } from "../services/Members.js";
import type { Reactions } from "../services/Reactions.js";
import type { CommandError } from "./errors.js";
import { TelegramCtx } from "./TelegramCtx.js";

/** Dipendenze massime disponibili a un comando. */
export type CommandDeps =
	TelegramCtx | BotConfig | Github | Members | Reactions;

export type Command = {
	/** Trigger: "/comando" (registrato via bot.command) o testo esatto tipo "@admin" (via bot.hears). */
	readonly triggers: readonly string[];
	readonly run: Effect.Effect<void, CommandError, CommandDeps>;
};

type StaticOptions = {
	/** Se true e il comando è usato in reply, la risposta punta al messaggio quotato (es. /learn in reply a una domanda). */
	readonly preferRepliedMessage?: boolean;
};

/**
 * Helper per i comandi "reply statica": il caso più comune per i contributor.
 * Nessuna conoscenza di Effect richiesta: si passa il testo (o FormattedString
 * di @grammyjs/parse-mode per grassetti/link) e basta.
 */
export const staticCommand = (
	triggers: readonly string[],
	text: string | FormattedString | (() => FormattedString),
	options: StaticOptions = {},
): Command => ({
	triggers,
	run: Effect.gen(function* () {
		const telegram = yield* TelegramCtx;
		const message = telegram.message;
		const replyTo = options.preferRepliedMessage
			? (message?.reply_to_message?.message_id ?? message?.message_id)
			: message?.message_id;

		yield* telegram.reply(typeof text === "function" ? text() : text, {
			replyTo,
			disablePreview: true,
		});
	}),
});

/** Helper generico: triggers + programma Effect. */
export const defineCommand = (
	triggers: readonly string[],
	run: Effect.Effect<void, CommandError, CommandDeps>,
): Command => ({ triggers, run });
