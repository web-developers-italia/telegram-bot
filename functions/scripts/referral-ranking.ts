// Legge i referrer con almeno un invito da referrals e posta la classifica nel
// gruppo. Gira in GitHub Actions il primo giorno di ogni trimestre via
// .github/workflows/referral-ranking.yml. Legge Firestore con ADC (Workload
// Identity Federation), invia a Telegram via fetch nativo. Uso: gira con cwd = functions/.
// Env richieste: TELEGRAM_BOT_KEY, TELEGRAM_CHAT_ID.

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { rankingText, type ReferralRow } from "../src/community/referrals.js";

const TOP_LIMIT = 10;

const token = process.env.TELEGRAM_BOT_KEY;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
	console.error(
		"Variabili mancanti: servono TELEGRAM_BOT_KEY e TELEGRAM_CHAT_ID.",
	);
	process.exit(1);
}

initializeApp();

const snapshot = await getFirestore()
	.collection("referrals")
	.where("invites", ">", 0)
	.get();

const rows: ReferralRow[] = snapshot.docs.map((doc) => {
	const data = doc.data();
	return {
		userId: Number(doc.id),
		username: (data.username as string | null) ?? null,
		invites: data.invites as number,
	};
});

const top = rows.toSorted((a, b) => b.invites - a.invites).slice(0, TOP_LIMIT);

if (top.length === 0) {
	console.log("Nessun invito registrato.");
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

const sendResult = await callBotApi("sendMessage", {
	chat_id: chatId,
	text: rankingText(top),
});

if (!sendResult.ok) {
	console.error(`Classifica referral fallita: ${sendResult.description}`);
	process.exit(1);
}

console.log(`Classifica referral inviata: ${top.length} referrer.`);
