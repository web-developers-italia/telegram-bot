import { onRequest } from "firebase-functions/v2/https";
import { webhookCallback } from "grammy";
import type { Context } from "grammy";
import { TELEGRAM_BOT_KEY, TELEGRAM_WEBHOOK_SECRET } from "./config.js";
import { createBot } from "./telegram/createBot.js";

// Init lazy, obbligatoria: bot e handler vengono costruiti alla prima invocazione,
// non a livello modulo (i secret non sono ancora risolvibili al load del modulo).
let handler: ReturnType<typeof webhookCallback<Context, "express">> | undefined;

export const telegram = {
	webhook: onRequest(
		{
			region: "europe-west1",
			secrets: [TELEGRAM_BOT_KEY, TELEGRAM_WEBHOOK_SECRET],
			timeoutSeconds: 30,
			memory: "256MiB" as const,
		},
		async (req, res) => {
			if (!handler) {
				const bot = createBot(TELEGRAM_BOT_KEY.value());
				handler = webhookCallback(bot, "express", {
					secretToken: TELEGRAM_WEBHOOK_SECRET.value(),
					timeoutMilliseconds: 20_000,
				});
			}

			await handler(req, res);
		},
	),
};
