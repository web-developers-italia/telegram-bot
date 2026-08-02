import { fmt, FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import type { Message } from "grammy/types";
import { BotConfig } from "../../services/BotConfig.js";
import { defineCommand, type Command } from "../CommandsProtocol.js";
import type { TelegramApiError } from "../errors.js";
import { TelegramCtx } from "../TelegramCtx.js";

export const rulesText = (repoUrl: string): FormattedString =>
	fmt`${FormattedString.bold("Regolamento")}:

✅ Richieste di supporto ${FormattedString.bold("solo se specifiche, chiare, concise e accompagnate dalle soluzioni già provate")}.

❌ Richieste di aiuto in privato.

✅ Offerte di lavoro ${FormattedString.bold("solo se accompagnate da tipo di contratto e range di retribuzione")} (o budget).

❌ Spam di qualsiasi forma nel flusso di chat.

✅ Discussioni su news, lavoro e lifestyle del web developer e affini.

❌ Gore, porno, nudità e tutto ciò che può urtare la sensibilità dei membri del gruppo. Valido anche per le foto profilo.

✅ Richieste di supporto inerenti allo sviluppo web professionale.

❌ Abuso di sticker e messaggi vocali.

✅ Screenshot con strumenti del computer.

❌ Foto agli schermi con strumenti esterni al computer.

✅ Codice condiviso tramite strumenti specifici (Pastebin, Codepen, Stackblitz).

❌ Mandare messaggi con canali invece del proprio profilo personale.

✅ Richieste di supporto per riuscire a risolvere autonomamente esercizi scolastici.

Gli utenti sono tenuti a evitare comportamenti socialmente inadeguati, al fine di mantenere stabile e positiva la comunicazione nella chat.

${FormattedString.link("Contribuisci al gruppo su Github", repoUrl)}`;

export const sendRules: Effect.Effect<
	Message,
	TelegramApiError,
	TelegramCtx | BotConfig
> = Effect.gen(function* () {
	const telegram = yield* TelegramCtx;
	const config = yield* BotConfig;

	return yield* telegram.reply(rulesText(config.repoUrl), {
		replyTo: telegram.message?.message_id,
		disablePreview: true,
	});
});

export const rules: Command = defineCommand(
	["/regolamento", "/regole", "/rules"],
	sendRules.pipe(Effect.asVoid),
);
