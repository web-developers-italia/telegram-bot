import { fmt, FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import { InlineKeyboard } from "grammy";
import { BotConfig } from "../../services/BotConfig.js";
import { defineCommand, type Command } from "../CommandsProtocol.js";
import { TelegramCtx } from "../TelegramCtx.js";
import { sendRules } from "./rules.js";

const welcomeText = fmt`${FormattedString.bold("Benvenuto/a in Web Developers Italia! 👋")}

Siamo una community italiana di sviluppatori web. Entra nel gruppo e dai un'occhiata al regolamento coi pulsanti qui sotto.`;

const sendStart = Effect.gen(function* () {
	const telegram = yield* TelegramCtx;
	const config = yield* BotConfig;

	// Deep-link dal pulsante "Regolamento": /start regole -> mostra le regole.
	if (telegram.commandPayload === "regole") {
		yield* sendRules;
		return;
	}

	const keyboard = new InlineKeyboard()
		.url("🚀 Entra nel gruppo", config.groupUrl)
		.row()
		.url("📖 Regolamento", `https://t.me/${config.botUsername}?start=regole`);

	yield* telegram.reply(welcomeText, {
		replyTo: telegram.message?.message_id,
		disablePreview: true,
		replyMarkup: keyboard,
	});
});

export const start: Command = defineCommand(["/start"], sendStart);
