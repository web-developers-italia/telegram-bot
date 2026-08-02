import { Cause, Effect, Exit, Layer, Option } from "effect";
import type { ChatMember, ChatMemberUpdated, Message } from "grammy/types";
import { BotConfig, make as makeBotConfig } from "../services/BotConfig.js";
import { Github, type OpenItems } from "../services/Github.js";
import { Members, type WelcomeState } from "../services/Members.js";
import type { Command } from "../telegram/CommandsProtocol.js";
import {
	GithubUnavailable,
	StorageError,
	TelegramApiError,
} from "../telegram/errors.js";
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
	readonly chatMemberUpdate?: ChatMemberUpdated;
};

export const makeFakeTelegram = (options: FakeOptions = {}) => {
	const calls: Recorded = { replies: [], deleted: [], banned: [] };

	const service: TelegramCtxService = {
		message: options.message,
		chatType: options.chatType ?? options.message?.chat.type,
		chatMemberUpdate: options.chatMemberUpdate,
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

type MembersStubOptions = {
	readonly isRecentJoiner?: boolean;
	readonly isRecentJoinerFails?: boolean;
	readonly activeCounts?: { readonly last7: number; readonly last30: number };
	readonly activeCountsFails?: boolean;
	readonly welcomeState?: WelcomeState;
	readonly welcomeStateFails?: boolean;
};

export const membersStub = (options: MembersStubOptions = {}) => {
	const touched: Array<{ userId: number; username: string | undefined }> = [];
	const joined: number[] = [];
	const isRecentJoinerCalls: number[] = [];
	const welcomeStatesSet: Array<{ chatId: number; state: WelcomeState }> = [];
	const storageError = new StorageError({ cause: "stub" });

	const layer = Layer.succeed(Members, {
		touch: (userId, username) =>
			Effect.sync(() => void touched.push({ userId, username })),
		recordJoin: (userId) => Effect.sync(() => void joined.push(userId)),
		isRecentJoiner: (userId) =>
			Effect.sync(() => void isRecentJoinerCalls.push(userId)).pipe(
				Effect.flatMap(() =>
					options.isRecentJoinerFails
						? Effect.fail(storageError)
						: Effect.succeed(options.isRecentJoiner ?? false),
				),
			),
		activeCounts: () =>
			options.activeCountsFails
				? Effect.fail(storageError)
				: Effect.succeed(options.activeCounts ?? { last7: 0, last30: 0 }),
		welcomeState: () =>
			options.welcomeStateFails
				? Effect.fail(storageError)
				: Effect.succeed(options.welcomeState),
		setWelcomeState: (chatId, state) =>
			Effect.sync(() => void welcomeStatesSet.push({ chatId, state })),
	});
	return { layer, touched, joined, isRecentJoinerCalls, welcomeStatesSet };
};

export const testLayers = (items?: OpenItems) =>
	Layer.mergeAll(Layer.succeed(BotConfig, testConfig), githubStub(items));

/** Layer Members di default per i comandi che non testano esplicitamente Members. */
const defaultMembersLayer = () => membersStub().layer;

export const runCommandWith = (
	command: Command,
	service: TelegramCtxService,
	items?: OpenItems,
	membersLayer: Layer.Layer<Members, never, never> = defaultMembersLayer(),
) =>
	Effect.runPromise(
		command.run.pipe(
			Effect.provideService(TelegramCtx, service),
			Effect.provide(Layer.mergeAll(testLayers(items), membersLayer)),
		),
	);

/** Come runCommandWith ma restituisce l'Exit: per asserire sugli errori tipizzati. */
export const runCommandExit = (
	command: Command,
	service: TelegramCtxService,
	items?: OpenItems,
	membersLayer: Layer.Layer<Members, never, never> = defaultMembersLayer(),
) =>
	Effect.runPromiseExit(
		command.run.pipe(
			Effect.provideService(TelegramCtx, service),
			Effect.provide(Layer.mergeAll(testLayers(items), membersLayer)),
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
