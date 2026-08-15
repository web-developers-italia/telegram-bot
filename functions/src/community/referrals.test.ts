import { describe, expect, it } from "vitest";
import {
	inviteLinkName,
	rankingText,
	referrerFromLinkName,
	type ReferralRow,
} from "./referrals.js";

describe("inviteLinkName / referrerFromLinkName", () => {
	it("fa roundtrip tra userId e nome del link", () => {
		expect(referrerFromLinkName(inviteLinkName(42))).toBe(42);
	});

	it("undefined se il nome è assente", () => {
		expect(referrerFromLinkName(undefined)).toBeUndefined();
	});

	it("undefined se il nome non è nel formato ref:<id>", () => {
		expect(referrerFromLinkName("altro-link")).toBeUndefined();
		expect(referrerFromLinkName("ref:non-numerico")).toBeUndefined();
	});

	it("accetta solo interi positivi, senza spazi né notazioni alternative", () => {
		expect(referrerFromLinkName("ref:")).toBeUndefined();
		expect(referrerFromLinkName("ref:0")).toBeUndefined();
		expect(referrerFromLinkName("ref:-5")).toBeUndefined();
		expect(referrerFromLinkName("ref:0x10")).toBeUndefined();
		expect(referrerFromLinkName(" ref:5")).toBeUndefined();
		expect(referrerFromLinkName("ref:42")).toBe(42);
	});
});

describe("rankingText", () => {
	it("stringa vuota se non ci sono righe", () => {
		expect(rankingText([])).toBe("");
	});

	it("ordina per numero di inviti decrescente", () => {
		const rows: readonly ReferralRow[] = [
			{ userId: 1, username: "mario", invites: 2 },
			{ userId: 2, username: "anna", invites: 10 },
			{ userId: 3, username: "luca", invites: 5 },
		];

		const text = rankingText(rows);
		const lines = text.split("\n").slice(2, 5);

		expect(lines).toEqual([
			"1. @anna - 10 inviti",
			"2. @luca - 5 inviti",
			"3. @mario - 2 inviti",
		]);
	});

	it("usa 'utente <userId>' quando manca lo username", () => {
		const rows: readonly ReferralRow[] = [
			{ userId: 99, username: null, invites: 1 },
		];

		expect(rankingText(rows)).toContain("1. utente 99 - 1 inviti");
	});

	it("include la nota sulla scadenza a 90 giorni", () => {
		const rows: readonly ReferralRow[] = [
			{ userId: 1, username: "mario", invites: 2 },
		];

		expect(rankingText(rows)).toContain(
			"(contano gli inviti recenti: i contatori scadono dopo 90 giorni senza nuovi inviti)",
		);
	});
});
