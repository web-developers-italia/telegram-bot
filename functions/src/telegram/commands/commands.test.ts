import { describe, expect, it } from "vitest";
import {
	failureTag,
	makeFakeTelegram,
	message,
	runCommandExit,
	runCommandWith,
	testConfig,
} from "../../test/helpers.js";
import { admin } from "./admin.js";
import { contribute } from "./contribute.js";
import { dontasktoask } from "./dontasktoask.js";
import { learn } from "./learn.js";
import { pong } from "./pong.js";
import { rielabora } from "./rielabora.js";
import { rules } from "./rules.js";
import { start } from "./start.js";

describe("/start", () => {
	it("manda il benvenuto con i pulsanti Entra nel gruppo e Regolamento", async () => {
		const { service, calls } = makeFakeTelegram({
			message: message({ chat: { id: 7, type: "private" } } as never),
		});
		await runCommandWith(start, service);

		expect(calls.replies).toHaveLength(1);
		expect(calls.replies[0].text).toContain("Benvenuto");
		const buttons = calls.replies[0].replyMarkup?.inline_keyboard.flat() ?? [];
		const urls = buttons.map((b) => (b as { url?: string }).url);
		expect(urls).toContain(testConfig.groupUrl);
		expect(urls.some((u) => u?.includes("start=regole"))).toBe(true);
	});

	it("/start regole (deep-link) mostra il regolamento", async () => {
		const { service, calls } = makeFakeTelegram({
			message: message(),
			commandPayload: "regole",
		});
		await runCommandWith(start, service);

		expect(calls.replies[0].text).toContain("Regolamento");
		expect(calls.replies[0].replyMarkup).toBeUndefined();
	});
});

describe("/ping", () => {
	it("risponde /pong 🏓 in reply al comando", async () => {
		const { service, calls } = makeFakeTelegram({ message: message() });
		await runCommandWith(pong, service);

		expect(calls.replies).toHaveLength(1);
		expect(calls.replies[0].text).toContain("/pong 🏓");
		expect(calls.replies[0].replyTo).toBe(42);
	});
});

describe("/regole", () => {
	it("risponde col regolamento e il link alla repo", async () => {
		const { service, calls } = makeFakeTelegram({ message: message() });
		await runCommandWith(rules, service);

		expect(calls.replies).toHaveLength(1);
		expect(calls.replies[0].text).toContain("Regolamento");
		expect(calls.replies[0].text).toContain("Contribuisci al gruppo su Github");
		expect(calls.replies[0].replyTo).toBe(42);
		expect(calls.replies[0].disablePreview).toBe(true);
	});

	it("ha i trigger italiani e inglesi", () => {
		expect(rules.triggers).toEqual(["/regolamento", "/regole", "/rules"]);
	});
});

describe("/learn e /dontasktoask", () => {
	it("learn punta al messaggio quotato quando usato in reply", async () => {
		const quoted = message({ message_id: 10 });
		const { service, calls } = makeFakeTelegram({
			message: message({ reply_to_message: quoted } as never),
		});
		await runCommandWith(learn, service);

		expect(calls.replies[0].replyTo).toBe(10);
		expect(calls.replies[0].text).toContain("roadmap.sh");
	});

	it("dontasktoask senza reply punta al comando stesso", async () => {
		const { service, calls } = makeFakeTelegram({ message: message() });
		await runCommandWith(dontasktoask, service);

		expect(calls.replies[0].replyTo).toBe(42);
		expect(calls.replies[0].text).toContain("nonchiederedichiedere.com");
	});
});

describe("@admin", () => {
	it("notifica gli admin umani con mention invisibili", async () => {
		const { service, calls } = makeFakeTelegram({
			message: message(),
			admins: [
				{ user: { id: 1, is_bot: false, first_name: "A" }, status: "creator" },
				{
					user: { id: 2, is_bot: true, first_name: "Bot" },
					status: "administrator",
				},
			] as never,
		});
		await runCommandWith(admin, service);

		expect(calls.replies).toHaveLength(1);
		expect(calls.replies[0].text).toContain(
			"Gli amministratori sono stati notificati.",
		);
	});

	it("fallisce con NotAGroup in chat privata", async () => {
		const { service } = makeFakeTelegram({
			message: message({ chat: { id: 5, type: "private" } } as never),
		});

		const exit = await runCommandExit(admin, service);
		expect(failureTag(exit)).toBe("NotAGroup");
	});
});

describe("/contribute", () => {
	it("elenca PR e issue aperte con il link alla repo", async () => {
		const { service, calls } = makeFakeTelegram({ message: message() });
		await runCommandWith(contribute, service, {
			pullRequests: [{ number: 1, title: "Fix!", htmlUrl: "https://pr" }],
			issues: [{ number: 2, title: "Bug (strano)", htmlUrl: "https://issue" }],
		});

		const reply = calls.replies[0];
		expect(reply.text).toContain("Contribuisci al gruppo su Github");
		expect(reply.text).toContain("#1 - Fix!");
		expect(reply.text).toContain("#2 - Bug (strano)");
		expect(reply.disablePreview).toBe(true);
	});

	it("omette le sezioni vuote", async () => {
		const { service, calls } = makeFakeTelegram({ message: message() });
		await runCommandWith(contribute, service, {
			pullRequests: [],
			issues: [],
		});

		expect(calls.replies[0].text).not.toContain("Pull Request attive");
		expect(calls.replies[0].text).not.toContain("Issue attive");
	});
});

describe("/rielabora", () => {
	it("senza reply fallisce con MissingReply e non cancella nulla", async () => {
		const { service, calls } = makeFakeTelegram({ message: message() });

		const exit = await runCommandExit(rielabora, service);
		expect(failureTag(exit)).toBe("MissingReply");
		expect(calls.deleted).toHaveLength(0);
	});

	it("con reply: manda il regolamento, cancella il messaggio e menziona l'autore", async () => {
		const target = message({
			message_id: 10,
			from: { id: 9, is_bot: false, first_name: "Anna", username: "anna" },
		} as never);
		const { service, calls } = makeFakeTelegram({
			message: message({ reply_to_message: target } as never),
			nextMessageId: 77,
		});
		await runCommandWith(rielabora, service);

		expect(calls.deleted).toEqual([10]);
		const mention = calls.replies.at(-1);
		expect(mention?.text).toContain("@anna");
		expect(mention?.text).toContain("rielabora la tua domanda");
		expect(mention?.replyTo).toBe(77);
	});
});
