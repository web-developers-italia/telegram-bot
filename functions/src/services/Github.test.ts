import { describe, expect, it } from "vitest";
import { splitIssuesAndPulls } from "./Github.js";

describe("splitIssuesAndPulls", () => {
	it("separa le PR dalle issue (l'endpoint /issues le mischia)", () => {
		const { pullRequests, issues } = splitIssuesAndPulls([
			{ number: 1, title: "PR", html_url: "https://pr", pull_request: {} },
			{ number: 2, title: "Issue", html_url: "https://issue" },
		]);

		expect(pullRequests).toEqual([
			{ number: 1, title: "PR", htmlUrl: "https://pr" },
		]);
		expect(issues).toEqual([
			{ number: 2, title: "Issue", htmlUrl: "https://issue" },
		]);
	});

	it("con lista vuota restituisce liste vuote", () => {
		expect(splitIssuesAndPulls([])).toEqual({ pullRequests: [], issues: [] });
	});
});
