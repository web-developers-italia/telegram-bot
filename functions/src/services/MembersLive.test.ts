import { describe, expect, it } from "vitest";
import { expiryFrom, shouldThrottle } from "./MembersLive.js";

describe("shouldThrottle", () => {
	it("non throttla se non c'è mai stata una scrittura", () => {
		expect(shouldThrottle(undefined, Date.now())).toBe(false);
	});

	it("throttla entro 15 minuti dall'ultima scrittura", () => {
		const now = Date.now();
		const fourteenMinutesAgo = now - 14 * 60 * 1000;
		expect(shouldThrottle(fourteenMinutesAgo, now)).toBe(true);
	});

	it("non throttla oltre i 15 minuti dall'ultima scrittura", () => {
		const now = Date.now();
		const sixteenMinutesAgo = now - 16 * 60 * 1000;
		expect(shouldThrottle(sixteenMinutesAgo, now)).toBe(false);
	});
});

describe("expiryFrom", () => {
	it("restituisce una data a +90 giorni esatti", () => {
		const now = Date.now();
		const expected = now + 90 * 24 * 60 * 60 * 1000;
		expect(expiryFrom(now).getTime()).toBe(expected);
	});
});
