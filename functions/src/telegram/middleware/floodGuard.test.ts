import { Effect } from "effect";
import type { Message } from "grammy/types";
import { describe, expect, it } from "vitest";
import { makeFakeTelegram, message } from "../../test/helpers.js";
import { TelegramCtx } from "../TelegramCtx.js";
import {
	FLOOD_MAX,
	FLOOD_WINDOW_MS,
	makeFloodGuard,
	WARN_COOLDOWN_MS,
} from "./floodGuard.js";

const run = (program: Effect.Effect<void, never, never>): Promise<void> =>
	Effect.runPromise(program);

const send = async (
	guard: Effect.Effect<void, never, TelegramCtx>,
	overrides: Partial<Message> = {},
) => {
	const { service, calls } = makeFakeTelegram({ message: message(overrides) });
	await run(guard.pipe(Effect.provideService(TelegramCtx, service)));
	return calls;
};

describe("floodGuard", () => {
	it(`${FLOOD_MAX} messaggi nella finestra: nessun delete, nessun avviso`, async () => {
		const now = 0;
		const floodGuard = makeFloodGuard({ now: () => now });
		const deleted: number[] = [];
		const replies: unknown[] = [];

		for (let i = 1; i <= FLOOD_MAX; i++) {
			const calls = await send(floodGuard, { message_id: i });
			deleted.push(...calls.deleted);
			replies.push(...calls.replies);
		}

		expect(deleted).toHaveLength(0);
		expect(replies).toHaveLength(0);
	});

	it(`messaggio numero ${FLOOD_MAX + 1} nella finestra: delete e un avviso col nome utente`, async () => {
		const now = 0;
		const floodGuard = makeFloodGuard({ now: () => now });

		for (let i = 1; i <= FLOOD_MAX; i++) {
			await send(floodGuard, { message_id: i });
		}
		const calls = await send(floodGuard, { message_id: FLOOD_MAX + 1 });

		expect(calls.deleted).toEqual([FLOOD_MAX + 1]);
		expect(calls.replies).toHaveLength(1);
		expect(calls.replies[0].text).toContain("⚠️");
		expect(calls.replies[0].text).toContain("Mario");
	});

	it("messaggio subito dopo il flood: delete ma nessun secondo avviso (cooldown)", async () => {
		const now = 0;
		const floodGuard = makeFloodGuard({ now: () => now });

		for (let i = 1; i <= FLOOD_MAX + 1; i++) {
			await send(floodGuard, { message_id: i });
		}
		const calls = await send(floodGuard, { message_id: FLOOD_MAX + 2 });

		expect(calls.deleted).toEqual([FLOOD_MAX + 2]);
		expect(calls.replies).toHaveLength(0);
	});

	it("dopo il cooldown un nuovo flood avvisa di nuovo", async () => {
		let now = 0;
		const floodGuard = makeFloodGuard({ now: () => now });

		for (let i = 1; i <= FLOOD_MAX + 1; i++) {
			await send(floodGuard, { message_id: i });
		}
		now += WARN_COOLDOWN_MS;

		let calls;
		for (let i = 1; i <= FLOOD_MAX + 1; i++) {
			calls = await send(floodGuard, { message_id: 100 + i });
		}

		expect(calls?.deleted).toEqual([100 + FLOOD_MAX + 1]);
		expect(calls?.replies).toHaveLength(1);
	});

	it("messaggi distanziati oltre la finestra: nessun delete", async () => {
		let now = 0;
		const floodGuard = makeFloodGuard({ now: () => now });
		const deleted: number[] = [];

		for (let i = 1; i <= FLOOD_MAX + 3; i++) {
			now += FLOOD_WINDOW_MS + 1_000;
			const calls = await send(floodGuard, { message_id: i });
			deleted.push(...calls.deleted);
		}

		expect(deleted).toHaveLength(0);
	});

	it("chat privata: nessun delete anche oltre soglia", async () => {
		const now = 0;
		const floodGuard = makeFloodGuard({ now: () => now });
		const deleted: number[] = [];

		for (let i = 1; i <= FLOOD_MAX + 3; i++) {
			const calls = await send(floodGuard, {
				message_id: i,
				chat: { id: 1, type: "private", first_name: "Mario" },
			} as never);
			deleted.push(...calls.deleted);
		}

		expect(deleted).toHaveLength(0);
	});

	it("utenti diversi non si sommano", async () => {
		const now = 0;
		const floodGuard = makeFloodGuard({ now: () => now });
		const deleted: number[] = [];
		const users = [
			{ id: 7, is_bot: false, first_name: "Mario" },
			{ id: 8, is_bot: false, first_name: "Luigi" },
		];

		for (const from of users) {
			for (let i = 1; i <= 4; i++) {
				const calls = await send(floodGuard, {
					message_id: i + from.id * 100,
					from,
				} as never);
				deleted.push(...calls.deleted);
			}
		}

		expect(deleted).toHaveLength(0);
	});
});
