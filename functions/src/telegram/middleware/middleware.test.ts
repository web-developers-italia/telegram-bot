import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { makeFakeTelegram, membersStub, message } from "../../test/helpers.js";
import { TelegramApiError } from "../errors.js";
import { TelegramCtx } from "../TelegramCtx.js";
import { channelBan } from "./channelBan.js";
import { trackActivity } from "./trackActivity.js";

const run = <E>(program: Effect.Effect<void, E, never>): Promise<void> =>
	Effect.runPromise(program);

describe("channelBan", () => {
	it("banna e cancella i messaggi inviati come canale", async () => {
		const msg = message({
			sender_chat: { id: -100999, type: "channel", title: "Spam" },
		} as never);
		const { service, calls } = makeFakeTelegram({ message: msg });

		await run(channelBan.pipe(Effect.provideService(TelegramCtx, service)));

		expect(calls.banned).toEqual([-100999]);
		expect(calls.deleted).toEqual([42]);
		expect(calls.replies[0].text).toContain("eliminato per violazione");
	});

	it("ignora i messaggi normali e gli admin anonimi", async () => {
		const anonAdmin = message({
			sender_chat: { id: -1001, type: "supergroup", title: "Test" },
		} as never);
		for (const msg of [message(), anonAdmin]) {
			const { service, calls } = makeFakeTelegram({ message: msg });
			await run(channelBan.pipe(Effect.provideService(TelegramCtx, service)));
			expect(calls.banned).toHaveLength(0);
			expect(calls.deleted).toHaveLength(0);
		}
	});

	it("non fallisce se il bot non ha i permessi", async () => {
		const msg = message({
			sender_chat: { id: -100999, type: "channel", title: "Spam" },
		} as never);
		const { service } = makeFakeTelegram({ message: msg });
		const failing = {
			...service,
			banChatSenderChat: () =>
				Effect.fail(
					new TelegramApiError({
						method: "banChatSenderChat",
						cause: "no rights",
					}),
				),
		};

		await expect(
			run(channelBan.pipe(Effect.provideService(TelegramCtx, failing))),
		).resolves.toBeUndefined();
	});
});

describe("trackActivity", () => {
	it("registra utente e username", async () => {
		const { service } = makeFakeTelegram({ message: message() });
		const { layer, touched } = membersStub();

		await run(
			trackActivity.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(touched).toEqual([{ userId: 7, username: "mario" }]);
	});

	it("non registra nulla senza mittente", async () => {
		const { service } = makeFakeTelegram({
			message: message({ from: undefined } as never),
		});
		const { layer, touched } = membersStub();

		await run(
			trackActivity.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(touched).toHaveLength(0);
	});
});
