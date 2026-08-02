import { Layer, ManagedRuntime } from "effect";
import { logger } from "firebase-functions/logger";
import { Bot } from "grammy";
import type { UserFromGetMe } from "grammy/types";
import { BotConfig, BotConfigLive } from "../services/BotConfig.js";
import { Github, GithubLive } from "../services/Github.js";
import { Members } from "../services/Members.js";
import { MembersLive } from "../services/MembersLive.js";
import { commands } from "./commands/index.js";
import { channelBan } from "./middleware/channelBan.js";
import { linkGuard } from "./middleware/linkGuard.js";
import { trackActivity } from "./middleware/trackActivity.js";
import { welcome } from "./middleware/welcome.js";
import { makeCommandRunner } from "./runCommand.js";

export type CreateBotOptions = {
	readonly botInfo?: UserFromGetMe;
	readonly layer?: Layer.Layer<BotConfig | Github | Members, never, never>;
};

export const createBot = (
	token: string,
	options: CreateBotOptions = {},
): Bot => {
	const bot = new Bot(token, { botInfo: options.botInfo });
	const runtime = ManagedRuntime.make(
		options.layer ?? Layer.mergeAll(BotConfigLive, GithubLive, MembersLive),
	);
	const run = makeCommandRunner(runtime);

	bot.catch((error) => logger.error("unhandled bot error", error));

	// I tre middleware girano su ogni messaggio, comandi compresi: registrati
	// come pass-through prima dei comandi, chiamano sempre `next()`.
	bot.use(async (ctx, next) => {
		if (ctx.message) {
			await run(trackActivity)(ctx).catch((error) =>
				logger.error("trackActivity pass-through failed", error),
			);
			await run(channelBan)(ctx).catch((error) =>
				logger.error("channelBan pass-through failed", error),
			);
			await run(linkGuard)(ctx).catch((error) =>
				logger.error("linkGuard pass-through failed", error),
			);
		}
		await next();
	});

	bot.on("chat_member", run(welcome));

	for (const command of commands) {
		const commandNames = command.triggers
			.filter((trigger) => trigger.startsWith("/"))
			.map((trigger) => trigger.slice(1));
		const hearsTriggers = command.triggers.filter(
			(trigger) => !trigger.startsWith("/"),
		);

		if (commandNames.length > 0) bot.command(commandNames, run(command.run));
		if (hearsTriggers.length > 0) bot.hears(hearsTriggers, run(command.run));
	}

	return bot;
};
