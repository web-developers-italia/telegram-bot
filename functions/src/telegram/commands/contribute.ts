import { fmt, FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import { BotConfig } from "../../services/BotConfig.js";
import {
	Github,
	type GithubItem,
	type GithubService,
	type OpenItems,
} from "../../services/Github.js";
import { defineCommand, type Command } from "../CommandsProtocol.js";
import { TelegramCtx } from "../TelegramCtx.js";

const CACHE_TTL_MS = 5 * 60 * 1000;

// ponytail: cache keyed per istanza del servizio Github (WeakMap) invece che per owner/repo.
// In produzione il layer Github viene creato una sola volta (vedi createBot.ts), quindi si
// comporta come una cache TTL globale; nei test/dev ogni layer stub è un'istanza nuova e
// quindi non condivide mai la cache con le altre esecuzioni.
const cache = new WeakMap<
	GithubService,
	{ readonly items: OpenItems; readonly expiresAt: number }
>();

const fetchOpenItems = (github: GithubService, owner: string, repo: string) => {
	const cached = cache.get(github);
	if (cached && cached.expiresAt > Date.now())
		return Effect.succeed(cached.items);

	return github.listOpenItems(owner, repo).pipe(
		Effect.tap((items) =>
			Effect.sync(() => {
				cache.set(github, { items, expiresAt: Date.now() + CACHE_TTL_MS });
			}),
		),
	);
};

const itemLine = (item: GithubItem) =>
	FormattedString.link(`#${item.number} - ${item.title}`, item.htmlUrl);

const section = (title: string, items: readonly GithubItem[]) =>
	items.length === 0
		? new FormattedString("")
		: fmt`\n\n${title}\n${FormattedString.join(items.map(itemLine), "\n")}`;

const contributeText = (repoUrl: string, items: OpenItems) =>
	fmt`${FormattedString.bold(
		"Tramite il repository open source, puoi amministrare il gruppo democraticamente, decidere le regole, gli amministratori e il futuro del gruppo.",
	)}

✍️ ${FormattedString.link("Contribuisci al gruppo su Github", repoUrl)}${section(
		"Pull Request attive:",
		items.pullRequests,
	)}${section("Issue attive:", items.issues)}`;

const sendContribute = Effect.gen(function* () {
	const telegram = yield* TelegramCtx;
	const config = yield* BotConfig;
	const github = yield* Github;
	const items = yield* fetchOpenItems(github, config.orgName, config.repoName);

	yield* telegram.reply(contributeText(config.repoUrl, items), {
		replyTo: telegram.message?.message_id,
		disablePreview: true,
	});
});

export const contribute: Command = defineCommand(
	["/contribute", "/contribuisci"],
	sendContribute,
);
