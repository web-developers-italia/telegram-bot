import { Effect } from "effect";
import type {
	MessageReactionCountUpdated,
	MessageReactionUpdated,
} from "grammy/types";
import { describe, expect, it } from "vitest";
import { makeFakeTelegram, reactionsStub } from "../../test/helpers.js";
import { TelegramCtx } from "../TelegramCtx.js";
import { reactionTracker } from "./reactionTracker.js";

const reactionCountUpdate = (
	overrides: Partial<MessageReactionCountUpdated> = {},
): MessageReactionCountUpdated =>
	({
		chat: { id: -1001, type: "supergroup", title: "Test" },
		message_id: 42,
		date: 0,
		reactions: [],
		...overrides,
	}) as MessageReactionCountUpdated;

const reactionUpdate = (
	overrides: Partial<MessageReactionUpdated> = {},
): MessageReactionUpdated =>
	({
		chat: { id: -1001, type: "supergroup", title: "Test" },
		message_id: 42,
		date: 0,
		old_reaction: [],
		new_reaction: [],
		...overrides,
	}) as MessageReactionUpdated;

const run = (program: Effect.Effect<void, never, never>): Promise<void> =>
	Effect.runPromise(program);

describe("reactionTracker", () => {
	it("message_reaction_count: setCount con la somma dei total_count", async () => {
		const messageReactionCount = reactionCountUpdate({
			reactions: [{ total_count: 3 }, { total_count: 2 }] as never,
		});
		const { service } = makeFakeTelegram({ messageReactionCount });
		const { layer, setCountCalls } = reactionsStub();

		await run(
			reactionTracker.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(setCountCalls).toEqual([{ chatId: -1001, messageId: 42, count: 5 }]);
	});

	it("message_reaction: reazione aggiunta (old [] -> new [1]): applyDelta +1", async () => {
		const messageReaction = reactionUpdate({
			old_reaction: [],
			new_reaction: [{}] as never,
		});
		const { service } = makeFakeTelegram({ messageReaction });
		const { layer, applyDeltaCalls } = reactionsStub();

		await run(
			reactionTracker.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(applyDeltaCalls).toEqual([
			{ chatId: -1001, messageId: 42, delta: 1 },
		]);
	});

	it("message_reaction: reazione rimossa (old [1] -> new []): applyDelta -1", async () => {
		const messageReaction = reactionUpdate({
			old_reaction: [{}] as never,
			new_reaction: [],
		});
		const { service } = makeFakeTelegram({ messageReaction });
		const { layer, applyDeltaCalls } = reactionsStub();

		await run(
			reactionTracker.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(applyDeltaCalls).toEqual([
			{ chatId: -1001, messageId: 42, delta: -1 },
		]);
	});

	it("message_reaction: stesso numero di reazioni (delta 0): nessuna chiamata", async () => {
		const messageReaction = reactionUpdate({
			old_reaction: [{}] as never,
			new_reaction: [{}] as never,
		});
		const { service } = makeFakeTelegram({ messageReaction });
		const { layer, applyDeltaCalls } = reactionsStub();

		await run(
			reactionTracker.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(applyDeltaCalls).toHaveLength(0);
	});

	it("chat privata: nessuna chiamata", async () => {
		const messageReaction = reactionUpdate({
			chat: { id: 7, type: "private", first_name: "Mario" } as never,
			new_reaction: [{}] as never,
		});
		const { service } = makeFakeTelegram({ messageReaction });
		const { layer, applyDeltaCalls, setCountCalls } = reactionsStub();

		await run(
			reactionTracker.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(applyDeltaCalls).toHaveLength(0);
		expect(setCountCalls).toHaveLength(0);
	});
});
