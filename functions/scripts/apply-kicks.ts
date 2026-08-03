// Esegue il kick (rejoinabile) dei candidati in moderation/pending-kicks.json,
// avvisa il gruppo e resetta il file. Gira in GitHub Actions al merge della PR
// aperta da .github/workflows/inactive-cleanup.yml.
// Env richieste: TELEGRAM_BOT_KEY, TELEGRAM_CHAT_ID. Solo fetch nativo, niente firebase-admin.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { emptyPending, type PendingKicks } from "../src/moderation/inactive.js";

const token = process.env.TELEGRAM_BOT_KEY;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
	console.error(
		"Variabili mancanti: servono TELEGRAM_BOT_KEY e TELEGRAM_CHAT_ID.",
	);
	process.exit(1);
}

const pendingPath = path.resolve("..", "moderation", "pending-kicks.json");
const pending = JSON.parse(await readFile(pendingPath, "utf8")) as PendingKicks;

if (pending.candidates.length === 0) {
	console.log("Nessun candidato al kick, nulla da fare.");
	process.exit(0);
}

type TelegramApiResponse = { ok: boolean; description?: string };

const callBotApi = (
	method: string,
	body: Record<string, unknown>,
): Promise<TelegramApiResponse> =>
	fetch(`https://api.telegram.org/bot${token}/${method}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	}).then((res) => res.json());

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let kicked = 0;

for (const candidate of pending.candidates) {
	try {
		const banRes = await callBotApi("banChatMember", {
			chat_id: chatId,
			user_id: candidate.userId,
		});
		if (!banRes.ok) {
			console.error(
				`Ban fallito per userId=${candidate.userId}: ${banRes.description}`,
			);
			continue;
		}
		await callBotApi("unbanChatMember", {
			chat_id: chatId,
			user_id: candidate.userId,
			only_if_banned: true,
		});
		kicked += 1;
	} catch (error) {
		console.error(`Kick fallito per userId=${candidate.userId}:`, error);
	} finally {
		await sleep(50);
	}
}

await callBotApi("sendMessage", {
	chat_id: chatId,
	text: `🧹 Pulizia: rimossi ${kicked} membri inattivi (oltre ${pending.thresholdDays} giorni). Possono rientrare col link.`,
});

const reset = emptyPending(new Date().toISOString(), pending.thresholdDays);
await writeFile(pendingPath, `${JSON.stringify(reset, null, "\t")}\n`);

console.log(`Kick eseguiti: ${kicked}/${pending.candidates.length}`);
