import { describe, expect, it } from "vitest";
import {
	digestText,
	linkedinText,
	messageLink,
	selectTop,
	type TopMessage,
} from "./digest.js";

describe("messageLink", () => {
	it("rimuove il prefisso -100 dell'id supergruppo", () => {
		expect(messageLink(-1001234567890, 55)).toBe(
			"https://t.me/c/1234567890/55",
		);
	});
});

describe("selectTop", () => {
	const rows: readonly TopMessage[] = [
		{ chatId: -1001, messageId: 1, reactions: 2 },
		{ chatId: -1001, messageId: 2, reactions: 10 },
		{ chatId: -1001, messageId: 3, reactions: 5 },
		{ chatId: -1001, messageId: 4, reactions: 3 },
	];

	it("filtra i messaggi sotto la soglia minima", () => {
		const top = selectTop(rows, 10, 4);
		expect(top.map((row) => row.messageId)).toEqual([2, 3]);
	});

	it("ordina per reazioni decrescenti", () => {
		const top = selectTop(rows, 10, 0);
		expect(top.map((row) => row.messageId)).toEqual([2, 3, 4, 1]);
	});

	it("taglia al limit", () => {
		const top = selectTop(rows, 2, 0);
		expect(top).toHaveLength(2);
		expect(top.map((row) => row.messageId)).toEqual([2, 3]);
	});
});

describe("digestText", () => {
	it("numera i messaggi e include il link diretto", () => {
		const top: readonly TopMessage[] = [
			{ chatId: -1001234567890, messageId: 55, reactions: 12 },
			{ chatId: -1001234567890, messageId: 56, reactions: 8 },
		];

		const text = digestText(top);

		expect(text).toContain("1. 12 reazioni - https://t.me/c/1234567890/55");
		expect(text).toContain("2. 8 reazioni - https://t.me/c/1234567890/56");
	});

	it("stringa vuota se non ci sono messaggi sopra soglia", () => {
		expect(digestText([])).toBe("");
	});
});

describe("linkedinText", () => {
	it("contiene il link del gruppo come invito a entrare", () => {
		const top: readonly TopMessage[] = [
			{ chatId: -1001234567890, messageId: 55, reactions: 12 },
		];

		expect(linkedinText(top)).toContain("https://t.me/webdevitalia");
	});

	it("stringa vuota se non ci sono messaggi sopra soglia", () => {
		expect(linkedinText([])).toBe("");
	});
});
