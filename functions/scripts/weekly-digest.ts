// Legge i messaggi con più reazioni della settimana da message_reactions e
// posta il digest nel gruppo, stampando anche la versione per LinkedIn nel log
// del workflow. Gira in GitHub Actions ogni venerdì via
// .github/workflows/weekly-digest.yml. Legge Firestore con ADC (Workload
// Identity Federation), invia a Telegram via fetch nativo. Uso: gira con cwd = functions/.
// Env richieste: TELEGRAM_BOT_KEY, TELEGRAM_CHAT_ID.

import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import {
	digestText,
	linkedinText,
	selectTop,
	type TopMessage,
} from "../src/community/digest.js";
import { makeCallBotApi, requireTelegramEnv } from "./lib/telegram-api.js";

const TOP_LIMIT = 5;
const MIN_REACTIONS = 3;
const WINDOW_DAYS = 7;

const { token, chatId } = requireTelegramEnv();
const callBotApi = makeCallBotApi(token);

initializeApp();

const since = Timestamp.fromMillis(
	Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000,
);

const snapshot = await getFirestore()
	.collection("message_reactions")
	.where("updatedAt", ">", since)
	.get();

const rows: TopMessage[] = snapshot.docs.map((doc) => {
	const data = doc.data();
	return {
		chatId: data.chatId as number,
		messageId: data.messageId as number,
		reactions: data.reactions as number,
	};
});

const top = selectTop(rows, TOP_LIMIT, MIN_REACTIONS);

if (top.length === 0) {
	console.log("Nessun messaggio sopra soglia questa settimana.");
	process.exit(0);
}

try {
	const sendResult = await callBotApi("sendMessage", {
		chat_id: chatId,
		text: digestText(top),
		disable_web_page_preview: true,
	});

	if (!sendResult.ok) {
		console.error(`Digest fallito: ${sendResult.description}`);
		process.exit(1);
	}

	console.log(`Digest inviato: ${top.length} messaggi.`);
	console.log("--- Versione LinkedIn (copia da qui) ---");
	console.log(linkedinText(top));
} catch (error) {
	console.error("Digest fallito:", error);
	process.exit(1);
}
