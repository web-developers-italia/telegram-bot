import type { Update, UserFromGetMe } from "grammy/types";
import { beforeEach, describe, expect, it } from "vitest";
import { testLayers } from "../test/helpers.js";
import { membersStub, reactionsStub, referralsStub } from "../test/helpers.js";
import { Layer } from "effect";
import { createBot } from "./createBot.js";

const botInfo: UserFromGetMe = {
	id: 424242,
	is_bot: true,
	first_name: "TestBot",
	username: "webdevita_test_bot",
	can_join_groups: true,
	can_read_all_group_messages: true,
	supports_inline_queries: false,
	can_connect_to_business: false,
	has_main_web_app: false,
};

const update = (text: string, id = 1): Update =>
	({
		update_id: id,
		message: {
			message_id: 42,
			date: 0,
			chat: { id: -1001, type: "supergroup", title: "Test" },
			from: { id: 7, is_bot: false, first_name: "Mario", username: "mario" },
			text,
			entities:
				text.startsWith("/") || text.startsWith("@")
					? [
							{
								type: "bot_command" as const,
								offset: 0,
								length: text.split(" ")[0].length,
							},
						]
					: undefined,
		},
	}) as Update;

describe("createBot routing", () => {
	let apiCalls: Array<{ method: string; payload: Record<string, unknown> }>;
	let bot: ReturnType<typeof createBot>;

	beforeEach(() => {
		apiCalls = [];
		const { layer } = membersStub();
		const { layer: reactionsLayer } = reactionsStub();
		const { layer: referralsLayer } = referralsStub();
		bot = createBot("dummy-token", {
			botInfo,
			layer: Layer.mergeAll(
				testLayers(),
				layer,
				reactionsLayer,
				referralsLayer,
			),
		});
		bot.api.config.use(async (_prev, method, payload) => {
			apiCalls.push({ method, payload: payload as Record<string, unknown> });
			return {
				ok: true,
				result:
					method === "getChatAdministrators"
						? []
						: {
								message_id: 100,
								date: 0,
								chat: { id: -1001, type: "supergroup" },
								text: "x",
							},
			} as never;
		});
	});

	it("risponde a /ping", async () => {
		await bot.handleUpdate(update("/ping"));

		const send = apiCalls.find((c) => c.method === "sendMessage");
		expect(send?.payload.text).toContain("/pong");
	});

	it("risponde a /regole@webdevita_test_bot (comando con mention)", async () => {
		await bot.handleUpdate(update("/regole@webdevita_test_bot"));

		const send = apiCalls.find((c) => c.method === "sendMessage");
		expect(send?.payload.text).toContain("Regolamento");
	});

	it("ignora i comandi per altri bot", async () => {
		await bot.handleUpdate(update("/regole@altro_bot"));

		expect(apiCalls.find((c) => c.method === "sendMessage")).toBeUndefined();
	});

	it("reagisce a @admin come testo", async () => {
		await bot.handleUpdate(update("@admin"));

		const send = apiCalls.find((c) => c.method === "sendMessage");
		expect(send?.payload.text).toContain("amministratori");
	});

	it("un messaggio qualsiasi traccia l'attività e non risponde", async () => {
		await bot.handleUpdate(update("ciao a tutti"));

		expect(apiCalls.find((c) => c.method === "sendMessage")).toBeUndefined();
	});
});
