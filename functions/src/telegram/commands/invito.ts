import { fmt, FormattedString } from "@grammyjs/parse-mode";
import { Effect } from "effect";
import { inviteLinkName } from "../../community/referrals.js";
import { Referrals } from "../../services/Referrals.js";
import { defineCommand, type Command } from "../CommandsProtocol.js";
import { NotAGroup } from "../errors.js";
import { TelegramCtx } from "../TelegramCtx.js";

const isGroupChat = (chatType: string | undefined): boolean =>
	chatType === "group" || chatType === "supergroup";

const sendInvito = Effect.gen(function* () {
	const telegram = yield* TelegramCtx;

	if (!isGroupChat(telegram.chatType))
		return yield* Effect.fail(new NotAGroup());

	const from = telegram.message?.from;
	if (!from) return;

	const referrals = yield* Referrals;
	let url = yield* referrals.linkFor(from.id);

	if (!url) {
		const link = yield* telegram.createChatInviteLink(inviteLinkName(from.id));
		url = link.invite_link;
		yield* referrals.saveLink(from.id, from.username, url);
	}

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
