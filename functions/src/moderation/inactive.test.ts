import { describe, expect, it } from "vitest";
import { emptyPending, selectInactive, THRESHOLD_DAYS } from "./inactive.js";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("selectInactive", () => {
	it("restituisce [] se nessuno è inattivo", () => {
		const now = Date.now();
		const rows = [
			{ userId: 1, username: "a", lastActivityMs: now - 1 * DAY_MS },
			{ userId: 2, username: "b", lastActivityMs: now },
		];
		expect(selectInactive(rows, now)).toEqual([]);
	});

	it("seleziona solo le righe oltre la soglia, ordinate dalla più vecchia", () => {
		const now = Date.now();
		const rows = [
			{ userId: 1, username: "attivo", lastActivityMs: now - 1 * DAY_MS },
			{
				userId: 2,
				username: "vecchio",
				lastActivityMs: now - 90 * DAY_MS,
			},
			{
				userId: 3,
				username: "inattivo",
				lastActivityMs: now - 61 * DAY_MS,
			},
		];

		const result = selectInactive(rows, now);

		expect(result.map((c) => c.userId)).toEqual([2, 3]);
		expect(result[0]).toEqual({
			userId: 2,
			username: "vecchio",
			lastActivityIso: new Date(now - 90 * DAY_MS).toISOString(),
		});
	});

	it("rispetta il confine della soglia (esattamente alla soglia non è inattivo)", () => {
		const now = Date.now();
		const rows = [
			{
				userId: 1,
				username: null,
				lastActivityMs: now - THRESHOLD_DAYS * DAY_MS,
			},
			{
				userId: 2,
				username: null,
				lastActivityMs: now - THRESHOLD_DAYS * DAY_MS - 1,
			},
		];

		const result = selectInactive(rows, now);

		expect(result.map((c) => c.userId)).toEqual([2]);
	});

	it("supporta una soglia custom", () => {
		const now = Date.now();
		const rows = [
			{ userId: 1, username: null, lastActivityMs: now - 10 * DAY_MS },
		];

		expect(selectInactive(rows, now, 5)).toHaveLength(1);
		expect(selectInactive(rows, now, 30)).toEqual([]);
	});
});

describe("emptyPending", () => {
	it("produce una PendingKicks senza candidati", () => {
		const nowIso = new Date().toISOString();
		expect(emptyPending(nowIso, THRESHOLD_DAYS)).toEqual({
			generatedAt: nowIso,
			thresholdDays: THRESHOLD_DAYS,
			candidates: [],
		});
	});
});
