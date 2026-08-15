// Manda un reminder nel gruppo per ogni evento della community in
// src/community/events.ts che inizia nelle prossime 24 ore. Gira una volta al
// giorno via .github/workflows/event-reminder.yml: con cadenza giornaliera,
// ogni evento riceve UN solo reminder, tra 0 e 24 ore prima dell'inizio.
// Env richieste: TELEGRAM_BOT_KEY, TELEGRAM_CHAT_ID. Solo fetch nativo, niente firebase-admin.

import {
	events,
	eventsWithin,
	formatEventDate,
} from "../src/community/events.js";

const token = process.env.TELEGRAM_BOT_KEY;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
	console.error(
		"Variabili mancanti: servono TELEGRAM_BOT_KEY e TELEGRAM_CHAT_ID.",
	);
	process.exit(1);
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const imminent = eventsWithin(events, Date.now(), ONE_DAY_MS);

if (imminent.length === 0) {
	console.log("Nessun evento nelle prossime 24 ore.");
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

let sent = 0;

for (const event of imminent) {
	const text = event.url
		? `📅 Ci siamo: ${event.title} - ${formatEventDate(event.startsAtIso)}. Non mancare!\n${event.url}`
		: `📅 Ci siamo: ${event.title} - ${formatEventDate(event.startsAtIso)}. Non mancare!`;

	try {
		const res = await callBotApi("sendMessage", { chat_id: chatId, text });
		if (res.ok) {
			sent += 1;
		} else {
			console.error(`Reminder fallito per "${event.title}": ${res.description}`);
		}
	} catch (error) {
		console.error(`Reminder fallito per "${event.title}":`, error);
	}
}

console.log(`Reminder inviati: ${sent}/${imminent.length}`);
