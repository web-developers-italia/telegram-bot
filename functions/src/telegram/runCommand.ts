import { Effect, type ManagedRuntime } from "effect";
import { logger } from "firebase-functions/logger";
import type { Context } from "grammy";
import type { BotConfig } from "../services/BotConfig.js";
import type { Github } from "../services/Github.js";
import type { Members } from "../services/Members.js";
import type { CommandDeps } from "./CommandsProtocol.js";
import type { CommandError } from "./errors.js";
import { makeTelegramCtx, TelegramCtx } from "./TelegramCtx.js";

/** Dipendenze fornite dal ManagedRuntime del bot: tutto tranne TelegramCtx, che viene creato per update. */
type RunnerDeps = BotConfig | Github | Members;

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

		const courtesyReply = (text: string) =>
			telegram.reply(text, { replyTo }).pipe(
				Effect.asVoid,
				Effect.catchAll((error) =>
					Effect.sync(() => logger.error("courtesy reply failed", error)),
				),
			);

		const handled = program.pipe(
			Effect.provideService(TelegramCtx, telegram),
			Effect.catchTags({
				MissingReply: () =>
					courtesyReply("Usa questo comando in risposta a un messaggio."),
				NotAGroup: () =>
					courtesyReply("Questo comando funziona solo nel gruppo."),
				GithubRateLimited: () =>
					courtesyReply("GitHub non risponde al momento, riprova più tardi."),
				GithubUnavailable: () =>
					courtesyReply("GitHub non risponde al momento, riprova più tardi."),
				TelegramApiError: (error) =>
					Effect.sync(() => logger.error("telegram api error", error)),
			}),
		);

		await runtime.runPromise(handled);
	};
