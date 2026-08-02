import { Cause, Effect, Exit, Layer, Option } from "effect";
import type { ChatMember, Message } from "grammy/types";
import { BotConfig, make as makeBotConfig } from "../services/BotConfig.js";
import { Github, type OpenItems } from "../services/Github.js";
import { Members } from "../services/Members.js";
import type { Command } from "../telegram/CommandsProtocol.js";
import { GithubUnavailable, TelegramApiError } from "../telegram/errors.js";
import {
	TelegramCtx,
	type TelegramCtxService,
} from "../telegram/TelegramCtx.js";

export type RecordedReply = {
	readonly text: string;
	readonly replyTo?: number;
	readonly disablePreview?: boolean;
};

export type Recorded = {
	replies: RecordedReply[];
	deleted: number[];
	banned: number[];
};

export const message = (overrides: Partial<Message> = {}): Message =>
	({
		message_id: 42,
		date: 0,
		chat: { id: -1001, type: "supergroup", title: "Test" },
		from: { id: 7, is_bot: false, first_name: "Mario", username: "mario" },
		...overrides,
	}) as Message;

type FakeOptions = {
	readonly message?: Message;
	readonly chatType?: string;
	readonly admins?: readonly ChatMember[];
	readonly nextMessageId?: number;
};

export const makeFakeTelegram = (options: FakeOptions = {}) => {
	const calls: Recorded = { replies: [], deleted: [], banned: [] };

	const service: TelegramCtxService = {
		message: options.message,
		chatType: options.chatType ?? options.message?.chat.type,
		reply: (text, replyOptions) =>
			Effect.sync(() => {
				calls.replies.push({
					text: typeof text === "string" ? text : text.text,
					replyTo: replyOptions?.replyTo,
					disablePreview: replyOptions?.disablePreview,
				});
				return message({
					message_id: options.nextMessageId ?? 100,
				});
			}),
		deleteMessage: (id) => Effect.sync(() => void calls.deleted.push(id)),
		banChatSenderChat: (id) => Effect.sync(() => void calls.banned.push(id)),
		getChatAdministrators: () =>
			options.admins
				? Effect.succeed(options.admins)
				: Effect.fail(
						new TelegramApiError({
							method: "getChatAdministrators",
							cause: "not available",
						}),
					),
	};

	return { service, calls };
};

export const testConfig = makeBotConfig("test-org", "test-repo");

export const githubStub = (items?: OpenItems) =>
	Layer.succeed(Github, {
		listOpenItems: () =>
			items
				? Effect.succeed(items)
				: Effect.fail(new GithubUnavailable({ cause: "stub" })),
	});

export const membersStub = () => {
	const touched: Array<{ userId: number; username: string | undefined }> = [];
	const layer = Layer.succeed(Members, {
		touch: (userId, username) =>
			Effect.sync(() => void touched.push({ userId, username })),
	});
	return { layer, touched };
};

export const testLayers = (items?: OpenItems) =>
	Layer.mergeAll(Layer.succeed(BotConfig, testConfig), githubStub(items));

export const runCommandWith = (
	command: Command,
	service: TelegramCtxService,
	items?: OpenItems,
) =>
	Effect.runPromise(
		command.run.pipe(
			Effect.provideService(TelegramCtx, service),
			Effect.provide(testLayers(items)),
		),
	);

/** Come runCommandWith ma restituisce l'Exit: per asserire sugli errori tipizzati. */
export const runCommandExit = (
	command: Command,
	service: TelegramCtxService,
	items?: OpenItems,
) =>
	Effect.runPromiseExit(
		command.run.pipe(
			Effect.provideService(TelegramCtx, service),
			Effect.provide(testLayers(items)),
		),
	);

/** Estrae il _tag dell'errore atteso da un Exit fallito (o lancia se il programma è riuscito). */
export const failureTag = (
	exit: Exit.Exit<void, { readonly _tag: string }>,
): string =>
	Exit.isFailure(exit)
		? Option.getOrThrow(Cause.failureOption(exit.cause))._tag
		: (() => {
				throw new Error("expected failure, got success");
			})();
