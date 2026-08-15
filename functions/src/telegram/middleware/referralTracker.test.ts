import { Effect } from "effect";
import type { ChatMemberUpdated } from "grammy/types";
import { describe, expect, it } from "vitest";
import { makeFakeTelegram, referralsStub } from "../../test/helpers.js";
import { TelegramCtx } from "../TelegramCtx.js";
import { referralTracker } from "./referralTracker.js";

const chatMemberUpdate = (
	overrides: Partial<ChatMemberUpdated> = {},
): ChatMemberUpdated =>
	({
		chat: { id: -1001, type: "supergroup", title: "Test" },
		from: { id: 1, is_bot: false, first_name: "Admin" },
		date: 0,
		old_chat_member: {
			status: "left",
			user: { id: 9, is_bot: false, first_name: "New" },
		},
		new_chat_member: {
			status: "member",
			user: { id: 9, is_bot: false, first_name: "New" },
		},
		...overrides,
	}) as ChatMemberUpdated;

const run = (program: Effect.Effect<void, never, never>): Promise<void> =>
	Effect.runPromise(program);

describe("referralTracker", () => {
	it('join via link "ref:99": recordJoinVia(99)', async () => {
		const cmu = chatMemberUpdate({
			invite_link: { name: "ref:99" } as never,
		});
		const { service } = makeFakeTelegram({ chatMemberUpdate: cmu });
		const { layer, joinsRecorded } = referralsStub();

		await run(
			referralTracker.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(joinsRecorded).toEqual([99]);
	});

	it("join senza invite_link: nessuna chiamata", async () => {
		const cmu = chatMemberUpdate();
		const { service } = makeFakeTelegram({ chatMemberUpdate: cmu });
		const { layer, joinsRecorded } = referralsStub();

		await run(
			referralTracker.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(joinsRecorded).toHaveLength(0);
	});

	it("link con nome non-ref: nessuna chiamata", async () => {
		const cmu = chatMemberUpdate({
			invite_link: { name: "altro-link" } as never,
		});
		const { service } = makeFakeTelegram({ chatMemberUpdate: cmu });
		const { layer, joinsRecorded } = referralsStub();

		await run(
			referralTracker.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(joinsRecorded).toHaveLength(0);
	});

	it("auto-invito (referrer == utente che entra): nessuna chiamata", async () => {
		const cmu = chatMemberUpdate({
			invite_link: { name: "ref:9" } as never,
		});
		const { service } = makeFakeTelegram({ chatMemberUpdate: cmu });
		const { layer, joinsRecorded } = referralsStub();

		await run(
			referralTracker.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(joinsRecorded).toHaveLength(0);
	});

	it("update non-join (es. promote): nessuna chiamata", async () => {
		const cmu = chatMemberUpdate({
			old_chat_member: {
				status: "member",
				user: { id: 9, is_bot: false, first_name: "New" },
			} as never,
			new_chat_member: {
				status: "administrator",
				user: { id: 9, is_bot: false, first_name: "New" },
			} as never,
			invite_link: { name: "ref:1" } as never,
		});
		const { service } = makeFakeTelegram({ chatMemberUpdate: cmu });
		const { layer, joinsRecorded } = referralsStub();

		await run(
			referralTracker.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(joinsRecorded).toHaveLength(0);
	});
});
