// Legge i referrer con almeno un invito da referrals e posta la classifica nel
// gruppo. Gira in GitHub Actions il primo giorno di ogni trimestre via
// .github/workflows/referral-ranking.yml. Legge Firestore con ADC (Workload
// Identity Federation), invia a Telegram via fetch nativo. Uso: gira con cwd = functions/.
// Env richieste: TELEGRAM_BOT_KEY, TELEGRAM_CHAT_ID.

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { rankingText, type ReferralRow } from "../src/community/referrals.js";
import { makeCallBotApi, requireTelegramEnv } from "./lib/telegram-api.js";

const TOP_LIMIT = 10;

const { token, chatId } = requireTelegramEnv();
const callBotApi = makeCallBotApi(token);

initializeApp();

const snapshot = await getFirestore()
	.collection("referrals")
	.where("invites", ">", 0)
	.orderBy("invites", "desc")
	.limit(TOP_LIMIT)
	.get();

const top: ReferralRow[] = snapshot.docs.map((doc) => {
	const data = doc.data();
	return {
		userId: Number(doc.id),
		username: (data.username as string | null) ?? null,
		invites: data.invites as number,
	};
});

if (top.length === 0) {
	console.log("Nessun invito registrato.");
	process.exit(0);
}

try {
	const sendResult = await callBotApi("sendMessage", {
		chat_id: chatId,
		text: rankingText(top),
	});

	if (!sendResult.ok) {
		console.error(`Classifica referral fallita: ${sendResult.description}`);
		process.exit(1);
	}

	console.log(`Classifica referral inviata: ${top.length} referrer.`);
} catch (error) {
	console.error("Classifica referral fallita:", error);
	process.exit(1);
}
