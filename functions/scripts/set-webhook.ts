// Script una tantum per registrare il webhook del bot su Telegram.
// Uso: TELEGRAM_BOT_KEY=... WEBHOOK_URL=... TELEGRAM_WEBHOOK_SECRET=... npm run webhook:set

const token = process.env.TELEGRAM_BOT_KEY;
const webhookUrl = process.env.WEBHOOK_URL;
const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token || !webhookUrl || !secretToken) {
	console.error(
		"Variabili mancanti: servono TELEGRAM_BOT_KEY, WEBHOOK_URL e TELEGRAM_WEBHOOK_SECRET nell'ambiente.",
	);
	process.exit(1);
}

const setResponse = await fetch(
	`https://api.telegram.org/bot${token}/setWebhook`,
	{
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			url: webhookUrl,
			secret_token: secretToken,
			allowed_updates: [
				"message",
				"edited_message",
				"chat_member",
				"my_chat_member",
				"callback_query",
				"message_reaction",
				"message_reaction_count",
			],
		}),
	},
);
console.log("setWebhook:", await setResponse.json());

const infoResponse = await fetch(
	`https://api.telegram.org/bot${token}/getWebhookInfo`,
);
console.log("getWebhookInfo:", await infoResponse.json());
