import { Context, Duration, Effect, Layer } from "effect";
import { Octokit } from "octokit";
import { GithubRateLimited, GithubUnavailable } from "../telegram/errors.js";

export type GithubItem = {
	readonly number: number;
	readonly title: string;
	readonly htmlUrl: string;
};

export type OpenItems = {
	readonly pullRequests: readonly GithubItem[];
	readonly issues: readonly GithubItem[];
};

export type GithubService = {
	readonly listOpenItems: (
		owner: string,
		repo: string,
	) => Effect.Effect<OpenItems, GithubRateLimited | GithubUnavailable>;
};

export class Github extends Context.Tag("Github")<Github, GithubService>() {}

type RawIssue = {
	readonly number: number;
	readonly title: string;
	readonly html_url: string;
	readonly pull_request?: object;
};

/** L'endpoint /issues di GitHub include anche le PR: le separa `pull_request`. */
export const splitIssuesAndPulls = (items: readonly RawIssue[]): OpenItems => {
	const toItem = ({ number, title, html_url }: RawIssue): GithubItem => ({
		number,
		title,
		htmlUrl: html_url,
	});

	return {
		pullRequests: items.filter((item) => item.pull_request).map(toItem),
		issues: items.filter((item) => !item.pull_request).map(toItem),
	};
};

const isRateLimit = (error: unknown): boolean => {
	const status = (error as { status?: number })?.status;
	if (status !== 403 && status !== 429) return false;
	const headers = (error as { response?: { headers?: Record<string, string> } })
		?.response?.headers;
	return status === 429 || headers?.["x-ratelimit-remaining"] === "0";
};

export const makeLive = (auth?: string): GithubService => {
	const octokit = new Octokit(auth ? { auth } : {});

	return {
		listOpenItems: (owner, repo) =>
			Effect.tryPromise({
				try: () =>
					octokit.request("GET /repos/{owner}/{repo}/issues", {
						owner,
						repo,
						state: "open",
						per_page: 50,
					}),
				catch: (cause) =>
					isRateLimit(cause)
						? new GithubRateLimited({})
						: new GithubUnavailable({ cause }),
			}).pipe(
				// ponytail: budget fisso 5s, niente retry — il webhook risponde entro
				// 10s o Telegram ri-consegna l'update (retry amplificato).
				Effect.timeoutFail({
					duration: Duration.seconds(5),
					onTimeout: () => new GithubUnavailable({ cause: "timeout" }),
				}),
				Effect.map((response) =>
					splitIssuesAndPulls(response.data as readonly RawIssue[]),
				),
			),
	};
};

export const GithubLive = Layer.sync(Github, () =>
	makeLive(process.env.GITHUB_TOKEN),
);
