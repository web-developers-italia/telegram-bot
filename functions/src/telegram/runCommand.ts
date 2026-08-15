import { Effect, type ManagedRuntime } from "effect";
import { logger } from "firebase-functions/logger";
import type { Context } from "grammy";
import type { BotConfig } from "../services/BotConfig.js";
import type { Github } from "../services/Github.js";
import type { Members } from "../services/Members.js";
import type { Reactions } from "../services/Reactions.js";
import type { CommandDeps } from "./CommandsProtocol.js";
import type { CommandError } from "./errors.js";
import { makeTelegramCtx, TelegramCtx } from "./TelegramCtx.js";

/** Dipendenze fornite dal ManagedRuntime del bot: tutto tranne TelegramCtx, che viene creato per update. */
type RunnerDeps = BotConfig | Github | Members | Reactions;

/**
 * Costruisce l'adattatore da programma Effect a middleware grammY:
 * fornisce TelegramCtx, chiude il canale errori con reply di cortesia (o solo
 * log per gli errori Telegram, per evitare loop di reply falliti), poi esegue
 * col runtime condiviso del bot.
 */
export const makeCommandRunner =
	(runtime: ManagedRuntime.ManagedRuntime<RunnerDeps, never>) =>
	(program: Effect.Effect<void, CommandError, CommandDeps | Members>) =>
	async (ctx: Context): Promise<void> => {
		const telegram = makeTelegramCtx(ctx);
		const replyTo = telegram.message?.message_id;

		const courtesyReply = (text: string, error?: CommandError) =>
			Effect.sync(() => {
				if (error) logger.warn("command failed", error);
			}).pipe(
				Effect.andThen(telegram.reply(text, { replyTo })),
				Effect.asVoid,
				Effect.catchAll((replyError) =>
					Effect.sync(() => logger.error("courtesy reply failed", replyError)),
				),
			);

		const handled = program.pipe(
			Effect.provideService(TelegramCtx, telegram),
			Effect.catchTags({
				MissingReply: () =>
					courtesyReply("Usa questo comando in risposta a un messaggio."),
				NotAGroup: () =>
					courtesyReply("Questo comando funziona solo nel gruppo."),
				NotAdmin: () =>
					courtesyReply("Questo comando è riservato agli amministratori."),
				StorageError: (error) =>
					courtesyReply(
						"Dati non disponibili al momento, riprova più tardi.",
						error,
					),
				GithubRateLimited: (error) =>
					courtesyReply(
						"GitHub non risponde al momento, riprova più tardi.",
						error,
					),
				GithubUnavailable: (error) =>
					courtesyReply(
						"GitHub non risponde al momento, riprova più tardi.",
						error,
					),
				TelegramApiError: (error) =>
					Effect.sync(() => logger.error("telegram api error", error)),
			}),
		);

		await runtime.runPromise(handled);
	};
