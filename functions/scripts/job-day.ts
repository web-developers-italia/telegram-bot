// Manda il post settimanale "Job day" nel gruppo. Gira ogni mercoledì via
// .github/workflows/job-day.yml con cadenza programmata.
// Env richieste: TELEGRAM_BOT_KEY, TELEGRAM_CHAT_ID. Solo fetch nativo, niente firebase-admin.

import { jobDayText } from "../src/community/jobday.js";

const token = process.env.TELEGRAM_BOT_KEY;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
	console.error(
		"Variabili mancanti: servono TELEGRAM_BOT_KEY e TELEGRAM_CHAT_ID.",
	);
	process.exit(1);
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

const text = jobDayText();

try {
	const res = await callBotApi("sendMessage", { chat_id: chatId, text });
	if (res.ok) {
		console.log("Job day inviato con successo.");
	} else {
		console.error(`Job day fallito: ${res.description}`);
		process.exit(1);
	}
} catch (error) {
	console.error("Job day fallito:", error);
	process.exit(1);
}
