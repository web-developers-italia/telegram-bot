// Helper condiviso per i cron script: env obbligatorie e chiamate alla Bot API.
// Solo fetch nativo, niente firebase-admin.

export type TelegramApiResponse = { ok: boolean; description?: string };

export const requireTelegramEnv = (): { token: string; chatId: string } => {
	const token = process.env.TELEGRAM_BOT_KEY;
	const chatId = process.env.TELEGRAM_CHAT_ID;
	if (!token || !chatId) {
		console.error(
			"Variabili mancanti: servono TELEGRAM_BOT_KEY e TELEGRAM_CHAT_ID.",
		);
		process.exit(1);
	}
	return { token, chatId };
};

export const makeCallBotApi =
	(token: string) =>
	(
		method: string,
		body: Record<string, unknown>,
	): Promise<TelegramApiResponse> =>
		fetch(`https://api.telegram.org/bot${token}/${method}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		}).then((res) => res.json() as Promise<TelegramApiResponse>);
