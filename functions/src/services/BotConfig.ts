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

const DEFAULT_ORG = "web-developers-italia";
const DEFAULT_REPO = "telegram-bot";

export const ORG_NAME = defineString("ORG_NAME", { default: DEFAULT_ORG });
export const REPOSITORY_NAME = defineString("REPOSITORY_NAME", {
	default: DEFAULT_REPO,
});

export const make = (orgName: string, repoName: string): BotConfigService => ({
	orgName,
	repoName,
	repoUrl: `https://github.com/${orgName}/${repoName}`,
});

// I default di defineString vengono iniettati solo nel runtime Firebase (al
// deploy): in dev polling .value() torna stringa vuota → fallback espliciti.
export const BotConfigLive = Layer.sync(BotConfig, () =>
	make(
		ORG_NAME.value() || DEFAULT_ORG,
		REPOSITORY_NAME.value() || DEFAULT_REPO,
	),
);
