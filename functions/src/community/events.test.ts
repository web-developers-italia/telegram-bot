import { describe, expect, it } from "vitest";
import {
	eventsWithin,
	formatEventDate,
	upcomingEvents,
	type CommunityEvent,
} from "./events.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const event = (overrides: Partial<CommunityEvent>): CommunityEvent => ({
	title: "Evento",
	startsAtIso: "2026-01-01T00:00:00+01:00",
	...overrides,
});

describe("upcomingEvents", () => {
	it("filtra gli eventi passati", () => {
		const now = Date.parse("2026-06-01T00:00:00+02:00");
		const list = [
			event({ title: "Passato", startsAtIso: "2026-05-01T00:00:00+02:00" }),
			event({ title: "Futuro", startsAtIso: "2026-07-01T00:00:00+02:00" }),
		];

		expect(upcomingEvents(list, now).map((e) => e.title)).toEqual(["Futuro"]);
	});

	it("ordina gli eventi futuri per data crescente", () => {
		const now = Date.parse("2026-01-01T00:00:00+01:00");
		const list = [
			event({ title: "Terzo", startsAtIso: "2026-09-01T00:00:00+02:00" }),
			event({ title: "Primo", startsAtIso: "2026-03-01T00:00:00+01:00" }),
			event({ title: "Secondo", startsAtIso: "2026-06-01T00:00:00+02:00" }),
		];

		expect(upcomingEvents(list, now).map((e) => e.title)).toEqual([
			"Primo",
			"Secondo",
			"Terzo",
		]);
	});
});

describe("eventsWithin", () => {
	it("include gli eventi dentro la finestra", () => {
		const now = Date.parse("2026-01-01T00:00:00Z");
		const list = [
			event({
				title: "Dentro",
				startsAtIso: new Date(now + 60 * 60 * 1000).toISOString(),
			}),
		];

		expect(eventsWithin(list, now, DAY_MS).map((e) => e.title)).toEqual([
			"Dentro",
		]);
	});

	it("esclude gli eventi fuori dalla finestra", () => {
		const now = Date.parse("2026-01-01T00:00:00Z");
		const list = [
			event({
				title: "Troppo tardi",
				startsAtIso: new Date(now + 2 * DAY_MS).toISOString(),
			}),
			event({
				title: "Passato",
				startsAtIso: new Date(now - DAY_MS).toISOString(),
			}),
		];

		expect(eventsWithin(list, now, DAY_MS)).toEqual([]);
	});

	it("include il bordo inferiore: inizio esattamente a nowMs", () => {
		const now = Date.parse("2026-01-01T00:00:00Z");
		const list = [event({ startsAtIso: new Date(now).toISOString() })];

		expect(eventsWithin(list, now, DAY_MS)).toHaveLength(1);
	});

	it("esclude il bordo superiore: inizio esattamente a nowMs + windowMs", () => {
		const now = Date.parse("2026-01-01T00:00:00Z");
		const list = [event({ startsAtIso: new Date(now + DAY_MS).toISOString() })];

		expect(eventsWithin(list, now, DAY_MS)).toEqual([]);
	});
});

describe("formatEventDate", () => {
	it("formatta in italiano con timezone Europe/Rome, indipendentemente dal fuso locale", () => {
		expect(formatEventDate("2026-09-10T21:00:00+02:00")).toBe(
			"gio 10 settembre, 21:00",
		);
	});
});
