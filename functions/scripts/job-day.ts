// Manda il post settimanale "Job day" nel gruppo. Gira ogni mercoledì via
// .github/workflows/job-day.yml con cadenza programmata.
// Env richieste: TELEGRAM_BOT_KEY, TELEGRAM_CHAT_ID. Solo fetch nativo, niente firebase-admin.

import { jobDayText } from "../src/community/jobday.js";
import { makeCallBotApi, requireTelegramEnv } from "./lib/telegram-api.js";

const { token, chatId } = requireTelegramEnv();
const callBotApi = makeCallBotApi(token);

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
