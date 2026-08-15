import { Effect } from "effect";
import { logger } from "firebase-functions/logger";
import { referrerFromLinkName } from "../../community/referrals.js";
import { Referrals } from "../../services/Referrals.js";
import { TelegramCtx } from "../TelegramCtx.js";
import { isNewJoin } from "./welcome.js";

/**
 * Gira sull'update chat_member: se il nuovo membro è entrato tramite un
 * invite link "ref:<userId>", attribuisce l'ingresso a quel referrer
 * incrementandone il conteggio inviti.
 *
 * ponytail: niente anti-farming (leave/rejoin ripetuti gonfiano il contatore):
 * accettabile, si vede a occhio in classifica; upgrade path: dedup per
 * (referrer, invitato) su Firestore.
 */
export const referralTracker: Effect.Effect<
	void,
	never,
	TelegramCtx | Referrals
> = Effect.gen(function* () {
	const telegram = yield* TelegramCtx;
	const cmu = telegram.chatMemberUpdate;
	if (!cmu || !isNewJoin(cmu)) return;

	const referrerId = referrerFromLinkName(cmu.invite_link?.name);
	if (referrerId === undefined) return;

	const joinedId = cmu.new_chat_member.user.id;
	if (referrerId === joinedId) return;

	const referrals = yield* Referrals;
	yield* referrals.recordJoinVia(referrerId);
}).pipe(
	Effect.catchAll((error) =>
		Effect.sync(() => logger.warn("referralTracker failed", error)),
	),
);
