import { Effect } from "effect";
import type { ChatMemberUpdated } from "grammy/types";
import { describe, expect, it } from "vitest";
import { makeFakeTelegram, membersStub } from "../../test/helpers.js";
import { TelegramCtx } from "../TelegramCtx.js";
import { welcome } from "./welcome.js";

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

describe("welcome", () => {
	it("nuovo membro: recordJoin, reply di benvenuto, setWelcomeState", async () => {
		const cmu = chatMemberUpdate();
		const { service, calls } = makeFakeTelegram({
			chatMemberUpdate: cmu,
			nextMessageId: 55,
		});
		const { layer, joined, welcomeStatesSet } = membersStub();

		await run(
			welcome.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(joined).toEqual([9]);
		expect(calls.replies).toHaveLength(1);
		expect(calls.replies[0].text).toContain("Benvenuto/a");
		expect(calls.replies[0].text).toContain("New");
		expect(calls.replies[0].text).toContain("/regole");
		expect(calls.replies[0].text).toContain("/dontasktoask");
		expect(calls.replies[0].text).toContain("/learn");
		expect(welcomeStatesSet).toHaveLength(1);
		expect(welcomeStatesSet[0].chatId).toBe(-1001);
		expect(welcomeStatesSet[0].state.messageId).toBe(55);
	});

	it("secondo join entro 60s: vecchio welcome cancellato, nessuna nuova reply", async () => {
		const cmu = chatMemberUpdate();
		const { service, calls } = makeFakeTelegram({ chatMemberUpdate: cmu });
		const { layer } = membersStub({
			welcomeState: { messageId: 42, sentAtMs: Date.now() - 30_000 },
		});

		await run(
			welcome.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(calls.deleted).toEqual([42]);
		expect(calls.replies).toHaveLength(0);
	});

	it("join dopo 60s: vecchio welcome cancellato e nuova reply inviata", async () => {
		const cmu = chatMemberUpdate();
		const { service, calls } = makeFakeTelegram({
			chatMemberUpdate: cmu,
			nextMessageId: 77,
		});
		const { layer, welcomeStatesSet } = membersStub({
			welcomeState: { messageId: 42, sentAtMs: Date.now() - 70_000 },
		});

		await run(
			welcome.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(calls.deleted).toEqual([42]);
		expect(calls.replies).toHaveLength(1);
		expect(welcomeStatesSet[0].state.messageId).toBe(77);
	});

	it("update chat_member non-join (es. left): nessuna azione", async () => {
		const cmu = chatMemberUpdate({
			old_chat_member: {
				status: "member",
				user: { id: 9, is_bot: false, first_name: "New" },
			} as never,
			new_chat_member: {
				status: "left",
				user: { id: 9, is_bot: false, first_name: "New" },
			} as never,
		});
		const { service, calls } = makeFakeTelegram({ chatMemberUpdate: cmu });
		const { layer, joined } = membersStub();

		await run(
			welcome.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(joined).toHaveLength(0);
		expect(calls.deleted).toHaveLength(0);
		expect(calls.replies).toHaveLength(0);
	});

	it("update senza chat_member (message normale): nessuna azione", async () => {
		const { service, calls } = makeFakeTelegram({});
		const { layer, joined } = membersStub();

		await run(
			welcome.pipe(
				Effect.provideService(TelegramCtx, service),
				Effect.provide(layer),
			),
		);

		expect(joined).toHaveLength(0);
		expect(calls.deleted).toHaveLength(0);
		expect(calls.replies).toHaveLength(0);
	});
});
