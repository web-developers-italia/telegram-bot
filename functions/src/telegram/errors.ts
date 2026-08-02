import { Data } from "effect";

export class TelegramApiError extends Data.TaggedError("TelegramApiError")<{
	readonly method: string;
	readonly cause: unknown;
}> {}

export class GithubRateLimited extends Data.TaggedError("GithubRateLimited")<{
	readonly resetAt?: string;
}> {}

export class GithubUnavailable extends Data.TaggedError("GithubUnavailable")<{
	readonly cause: unknown;
}> {}

export class MissingReply extends Data.TaggedError("MissingReply")<object> {}

export class NotAGroup extends Data.TaggedError("NotAGroup")<object> {}

export class NotAdmin extends Data.TaggedError("NotAdmin")<object> {}

export class StorageError extends Data.TaggedError("StorageError")<{
	readonly cause: unknown;
}> {}

export type CommandError =
	| TelegramApiError
	| GithubRateLimited
	| GithubUnavailable
	| MissingReply
	| NotAGroup
	| NotAdmin
	| StorageError;
