import { Context, Layer } from "effect";

export type BotConfigService = {
	readonly orgName: string;
	readonly repoName: string;
	readonly repoUrl: string;
};

export class BotConfig extends Context.Tag("BotConfig")<
	BotConfig,
	BotConfigService
>() {}

// Org e repo del progetto: costanti pubbliche, non variano per ambiente.
const ORG = "web-developers-italia";
const REPO = "telegram-bot";

export const make = (orgName: string, repoName: string): BotConfigService => ({
	orgName,
	repoName,
	repoUrl: `https://github.com/${orgName}/${repoName}`,
});

export const BotConfigLive = Layer.succeed(BotConfig, make(ORG, REPO));
