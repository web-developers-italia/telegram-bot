import { describe, expect, it } from "vitest";
import { jobDayText } from "./jobday.js";

describe("jobDayText", () => {
	it("contiene il titolo 'Job day'", () => {
		const text = jobDayText();
		expect(text).toContain("Job day");
	});

	it("contiene 'RAL'", () => {
		const text = jobDayText();
		expect(text).toContain("RAL");
	});

	it("contiene '/regole'", () => {
		const text = jobDayText();
		expect(text).toContain("/regole");
	});

	it("contiene la sezione 'Assumi?'", () => {
		const text = jobDayText();
		expect(text).toContain("Assumi?");
	});

	it("contiene la sezione 'Cerchi?'", () => {
		const text = jobDayText();
		expect(text).toContain("Cerchi?");
	});
});
