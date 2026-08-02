import { describe, expect, it } from "vitest";
import {
	failureTag,
	makeFakeTelegram,
	membersStub,
	message,
	runCommandExit,
	runCommandWith,
} from "../../test/helpers.js";
import { stats } from "./stats.js";

const admins = [
	{ user: { id: 1, is_bot: false, first_name: "Admin" }, status: "creator" },
] as never;

describe("/stats", () => {
	it("fallisce con NotAGroup in chat privata", async () => {
		const { service } = makeFakeTelegram({
			message: message({ chat: { id: 5, type: "private" } } as never),
		});

		const exit = await runCommandExit(stats, service);
		expect(failureTag(exit)).toBe("NotAGroup");
	});

	it("fallisce con NotAdmin se chi lo invoca non è amministratore", async () => {
		const { service } = makeFakeTelegram({ message: message(), admins });

		const exit = await runCommandExit(stats, service);
		expect(failureTag(exit)).toBe("NotAdmin");
	});

	it("risponde con i conteggi per un amministratore", async () => {
		const adminMessage = message({
			from: { id: 1, is_bot: false, first_name: "Admin" },
		} as never);
		const { service, calls } = makeFakeTelegram({
			message: adminMessage,
			admins,
		});
		const { layer } = membersStub({ activeCounts: { last7: 3, last30: 12 } });

		await runCommandWith(stats, service, undefined, layer);

		expect(calls.replies[0].text).toContain("3");
		expect(calls.replies[0].text).toContain("12");
		expect(calls.replies[0].replyTo).toBe(42);
	});
});
