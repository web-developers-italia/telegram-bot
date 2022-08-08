import * as functions from "firebase-functions";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Telegraf, Context } from "telegraf";
import { addUsernameCommand } from "./utils";
import { setLastMemberActivity } from "./setLastMemberActivity";
import type { CommandsProtocol } from "./CommandsProtocol";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TELEGRAM_BOT_KEY: string;
		}
	}
}

const telegramBot: Telegraf<Context> = new Telegraf(
	process.env.TELEGRAM_BOT_KEY,
);

fs.readdir(path.resolve(__dirname, "./commands")).then((list) => {
	const promises = list.reduce<
		Array<Promise<{ [fn: string]: CommandsProtocol<unknown> }>>
	>((acc, current) => {
		if (current.endsWith(".map")) {
			return acc;
		}

		return [...acc, import(`./commands/${current}`)];
	}, []);

	Promise.all(promises).then((commands) => {
		const allCommands = Object.assign({}, ...commands);

		for (const entry of Object.entries(allCommands) as [
			string,
			CommandsProtocol,
		][]) {
			const [, command] = entry;
			telegramBot.hears(
				command.triggers.map(addUsernameCommand).flat(),
				command,
			);
		}
	});
});

telegramBot.on("message", setLastMemberActivity);

export const bot = functions
	.region("europe-west1")
	.https.onRequest((req, res) => {
		telegramBot.handleUpdate(req.body, res);
		res.sendStatus(200);
	});
