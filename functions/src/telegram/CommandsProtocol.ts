import { Context } from "telegraf";

export type CommandsProtocol<ReturnType = unknown> = {
	middleware: (context: Context) => Promise<ReturnType>;
	triggers: string[];
};
