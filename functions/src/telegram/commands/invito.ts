import { fmt, FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import { inviteLinkName } from "../../community/referrals.js";
import { Referrals } from "../../services/Referrals.js";
import { isGroupChat } from "../chat.js";
import { defineCommand, type Command } from "../CommandsProtocol.js";
import { NotAGroup } from "../errors.js";
import { TelegramCtx } from "../TelegramCtx.js";

const NO_PERMISSION_TEXT =
	'⚠️ Non riesco a generare il tuo link: al bot manca il permesso admin "Invita utenti tramite link". Segnalalo a un admin del gruppo.';

const sendInvito = Effect.gen(function* () {
	const telegram = yield* TelegramCtx;

	if (!isGroupChat(telegram.chatType))
		return yield* Effect.fail(new NotAGroup());

	const from = telegram.message?.from;
	if (!from) return;

	const referrals = yield* Referrals;
	let url = yield* referrals.linkFor(from.id);

	if (!url) {
		const link = yield* telegram
			.createChatInviteLink(inviteLinkName(from.id))
			.pipe(
				Effect.catchTag("TelegramApiError", () =>
					telegram
						.reply(NO_PERMISSION_TEXT, {
							replyTo: telegram.message?.message_id,
						})
						.pipe(Effect.as(undefined)),
				),
			);
		if (!link) return;
		url = link.invite_link;
	}

	// ponytail: il link cachato non viene mai rivalidato: se un admin lo revoca
	// dall'app resta servito; rimedio manuale: cancellare il doc referrals/<userId>.
	yield* referrals.saveLink(from.id, from.username, url);

	yield* telegram.reply(
		fmt`🔗 ${FormattedString.mentionUser(from.first_name, from.id)}, questo è il tuo link d'invito personale: ${url}
Ogni dev che entra da qui è merito tuo. 🏆`,
		{ replyTo: telegram.message?.message_id, disablePreview: true },
	);
});

export const invito: Command = defineCommand(
	["/invito", "/invite"],
	sendInvito,
);
