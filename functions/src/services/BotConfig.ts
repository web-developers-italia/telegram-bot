import { Context, Layer } from "effect";
import { defineString } from "firebase-functions/params";

export type BotConfigService = {
	readonly orgName: string;
	readonly repoName: string;
	readonly repoUrl: string;
};

export class BotConfig extends Context.Tag("BotConfig")<
	BotConfig,
	BotConfigService
>() {}

export const ORG_NAME = defineString("ORG_NAME", {
	default: "web-developers-italia",
});
export const REPOSITORY_NAME = defineString("REPOSITORY_NAME", {
	default: "telegram-bot",
});

export const make = (orgName: string, repoName: string): BotConfigService => ({
	orgName,
	repoName,
	repoUrl: `https://github.com/${orgName}/${repoName}`,
});

export const BotConfigLive = Layer.sync(BotConfig, () =>
	make(ORG_NAME.value(), REPOSITORY_NAME.value()),
);
