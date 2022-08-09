import { CommandsProtocol } from "./CommandsProtocol";
import { addUsernameCommand } from "./utils";
import * as fs from "node:fs";
import * as path from "node:path";
import Context from "telegraf/typings/context";
import { Telegraf } from "telegraf/typings/telegraf";

export const bindCommands = (bot: Telegraf<Context>) => {
	return fs
		.readdirSync(path.resolve(__dirname, "./commands"))
		.filter((path) => path.endsWith(".js"))
		.map((commandPath) => require(`./commands/${commandPath}`))
		.map(({ triggers, middleware }: CommandsProtocol) => {
			console.info("bound commands", triggers.join(", "));
			return bot.hears(triggers.map(addUsernameCommand).flat(), middleware);
		});
};
