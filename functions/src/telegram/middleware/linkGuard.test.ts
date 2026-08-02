import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { makeFakeTelegram, membersStub, message } from "../../test/helpers.js";
import { TelegramCtx } from "../TelegramCtx.js";
import { linkGuard } from "./linkGuard.js";

const run = (program: Effect.Effect<void, never, never>): Promise<void> =>
	Effect.runPromise(program);

const withLink = message({
	entities: [{ type: "url", offset: 0, length: 18 }],
} as never);

describe("linkGuard", () => {
	it("cancella e avverte se il link arriva da un iscritto recente", async () => {
		const { service, calls } = makeFakeTelegram({ message: withLink });
		const { layer, isRecentJoinerCalls } = membersStub({
			isRecentJoiner: true,
		});

		await run(
			linkGuard.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(isRecentJoinerCalls).toEqual([7]);
		expect(calls.deleted).toEqual([42]);
		expect(calls.replies[0].text).toContain("⚠️");
	});

	it("non fa nulla se il link arriva da un membro vecchio", async () => {
		const { service, calls } = makeFakeTelegram({ message: withLink });
		const { layer } = membersStub({ isRecentJoiner: false });

		await run(
			linkGuard.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(calls.deleted).toHaveLength(0);
		expect(calls.replies).toHaveLength(0);
	});

	it("senza link non chiama mai isRecentJoiner", async () => {
		const { service, calls } = makeFakeTelegram({ message: message() });
		const { layer, isRecentJoinerCalls } = membersStub();

		await run(
			linkGuard.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(isRecentJoinerCalls).toHaveLength(0);
		expect(calls.deleted).toHaveLength(0);
		expect(calls.replies).toHaveLength(0);
	});

	it("non fallisce e non cancella nulla se isRecentJoiner fallisce con StorageError", async () => {
		const { service, calls } = makeFakeTelegram({ message: withLink });
		const { layer } = membersStub({ isRecentJoinerFails: true });

		await expect(
			run(
				linkGuard.pipe(
					Effect.provideService(TelegramCtx, service),
					Effect.provide(layer),
				),
			),
		).resolves.toBeUndefined();
		expect(calls.deleted).toHaveLength(0);
	});
});
