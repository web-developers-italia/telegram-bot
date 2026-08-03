import { Context, Layer } from "effect";

export type BotConfigService = {
	readonly orgName: string;
	readonly repoName: string;
	readonly repoUrl: string;
	readonly groupUrl: string;
	readonly botUsername: string;
};

export class BotConfig extends Context.Tag("BotConfig")<
	BotConfig,
	BotConfigService
>() {}

// Costanti pubbliche del progetto, non variano per ambiente.
const ORG = "web-developers-italia";
const REPO = "telegram-bot";
const GROUP_URL = "https://t.me/webdevitalia";
const BOT_USERNAME = "web_dev_italia_bot";

export const make = (orgName: string, repoName: string): BotConfigService => ({
	orgName,
	repoName,
	repoUrl: `https://github.com/${orgName}/${repoName}`,
	groupUrl: GROUP_URL,
	botUsername: BOT_USERNAME,
});

export const BotConfigLive = Layer.succeed(BotConfig, make(ORG, REPO));
