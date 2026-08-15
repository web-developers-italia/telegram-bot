import { Cause, Effect, Exit, Layer, Option } from "effect";
import type { InlineKeyboard } from "grammy";
import type {
	ChatInviteLink,
	ChatMember,
	ChatMemberUpdated,
	Message,
	MessageReactionCountUpdated,
	MessageReactionUpdated,
} from "grammy/types";
import { BotConfig, make as makeBotConfig } from "../services/BotConfig.js";
import { Github, type OpenItems } from "../services/Github.js";
import { Members, type WelcomeState } from "../services/Members.js";
import { Reactions } from "../services/Reactions.js";
import { Referrals } from "../services/Referrals.js";
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
	readonly replyMarkup?: InlineKeyboard;
};

export type Recorded = {
	replies: RecordedReply[];
	deleted: number[];
	banned: number[];
	createdInviteLinks: string[];
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
	readonly commandPayload?: string;
	readonly messageReaction?: MessageReactionUpdated;
	readonly messageReactionCount?: MessageReactionCountUpdated;
	/** URL restituita da createChatInviteLink; default un link fittizio stabile. */
	readonly inviteLinkUrl?: string;
};

export const makeFakeTelegram = (options: FakeOptions = {}) => {
	const calls: Recorded = {
		replies: [],
		deleted: [],
		banned: [],
		createdInviteLinks: [],
	};

	const service: TelegramCtxService = {
		message: options.message,
		chatType: options.chatType ?? options.message?.chat.type,
		commandPayload: options.commandPayload,
		chatMemberUpdate: options.chatMemberUpdate,
		messageReaction: options.messageReaction,
		messageReactionCount: options.messageReactionCount,
		reply: (text, replyOptions) =>
			Effect.sync(() => {
				calls.replies.push({
					text: typeof text === "string" ? text : text.text,
					replyTo: replyOptions?.replyTo,
					disablePreview: replyOptions?.disablePreview,
					replyMarkup: replyOptions?.replyMarkup,
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
		createChatInviteLink: (name) =>
			Effect.sync(() => {
				calls.createdInviteLinks.push(name);
				return {
					invite_link: options.inviteLinkUrl ?? "https://t.me/+fake-invite",
					name,
					creator: message().from,
					creates_join_request: false,
					is_primary: false,
					is_revoked: false,
				} as ChatInviteLink;
			}),
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

export const reactionsStub = () => {
	const applyDeltaCalls: Array<{
		chatId: number;
		messageId: number;
		delta: number;
	}> = [];
	const setCountCalls: Array<{
		chatId: number;
		messageId: number;
		count: number;
	}> = [];

	const layer = Layer.succeed(Reactions, {
		applyDelta: (chatId, messageId, delta) =>
			Effect.sync(
				() => void applyDeltaCalls.push({ chatId, messageId, delta }),
			),
		setCount: (chatId, messageId, count) =>
			Effect.sync(() => void setCountCalls.push({ chatId, messageId, count })),
	});
	return { layer, applyDeltaCalls, setCountCalls };
};

type ReferralsStubOptions = {
	readonly linkFor?: string;
	readonly linkForFails?: boolean;
};

export const referralsStub = (options: ReferralsStubOptions = {}) => {
	const savedLinks: Array<{
		userId: number;
		username: string | undefined;
		url: string;
	}> = [];
	const joinsRecorded: number[] = [];
	const storageError = new StorageError({ cause: "stub" });

	const layer = Layer.succeed(Referrals, {
		linkFor: () =>
			options.linkForFails
				? Effect.fail(storageError)
				: Effect.succeed(options.linkFor),
		saveLink: (userId, username, url) =>
			Effect.sync(() => void savedLinks.push({ userId, username, url })),
		recordJoinVia: (referrerId) =>
			Effect.sync(() => void joinsRecorded.push(referrerId)),
	});
	return { layer, savedLinks, joinsRecorded };
};

export const testLayers = (items?: OpenItems) =>
	Layer.mergeAll(Layer.succeed(BotConfig, testConfig), githubStub(items));

/** Layer Members di default per i comandi che non testano esplicitamente Members. */
const defaultMembersLayer = () => membersStub().layer;

/** Layer Reactions di default per i comandi che non testano esplicitamente Reactions. */
const defaultReactionsLayer = () => reactionsStub().layer;

/** Layer Referrals di default per i comandi che non testano esplicitamente Referrals. */
const defaultReferralsLayer = () => referralsStub().layer;

export const runCommandWith = (
	command: Command,
	service: TelegramCtxService,
	items?: OpenItems,
	membersLayer: Layer.Layer<Members, never, never> = defaultMembersLayer(),
	reactionsLayer: Layer.Layer<
		Reactions,
		never,
		never
	> = defaultReactionsLayer(),
	referralsLayer: Layer.Layer<
		Referrals,
		never,
		never
	> = defaultReferralsLayer(),
) =>
	Effect.runPromise(
		command.run.pipe(
			Effect.provideService(TelegramCtx, service),
			Effect.provide(
				Layer.mergeAll(
					testLayers(items),
					membersLayer,
					reactionsLayer,
					referralsLayer,
				),
			),
		),
	);

/** Come runCommandWith ma restituisce l'Exit: per asserire sugli errori tipizzati. */
export const runCommandExit = (
	command: Command,
	service: TelegramCtxService,
	items?: OpenItems,
	membersLayer: Layer.Layer<Members, never, never> = defaultMembersLayer(),
	reactionsLayer: Layer.Layer<
		Reactions,
		never,
		never
	> = defaultReactionsLayer(),
	referralsLayer: Layer.Layer<
		Referrals,
		never,
		never
	> = defaultReferralsLayer(),
) =>
	Effect.runPromiseExit(
		command.run.pipe(
			Effect.provideService(TelegramCtx, service),
			Effect.provide(
				Layer.mergeAll(
					testLayers(items),
					membersLayer,
					reactionsLayer,
					referralsLayer,
				),
			),
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
