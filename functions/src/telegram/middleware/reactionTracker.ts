import { Effect } from "effect";
import { logger } from "firebase-functions/logger";
import { Reactions } from "../../services/Reactions.js";
import { isGroupChat } from "../chat.js";
import { TelegramCtx } from "../TelegramCtx.js";

/**
 * Gira sugli update message_reaction / message_reaction_count: aggiorna il
 * conteggio reazioni per messaggio (mai il testo). Quale dei due update arriva
 * dipende dalle impostazioni del gruppo (reazioni anonime o no): gestiamo
 * entrambi, dando priorità al conteggio aggregato quando presente.
 */
export const reactionTracker: Effect.Effect<
	void,
	never,
	TelegramCtx | Reactions
> = Effect.gen(function* () {
	const telegram = yield* TelegramCtx;

	const reactionCount = telegram.messageReactionCount;
	// ponytail: message_reaction_count arriva aggregato e ritardato: un setCount
	// stantio può temporaneamente sovrascrivere delta più freschi; deriva
	// transitoria, si riallinea al prossimo aggregato.
	if (reactionCount) {
		if (!isGroupChat(reactionCount.chat.type)) return;

		const total = reactionCount.reactions.reduce(
			(sum, reaction) => sum + reaction.total_count,
			0,
		);
		const reactions = yield* Reactions;
		yield* reactions.setCount(
			reactionCount.chat.id,
			reactionCount.message_id,
			total,
		);
		return;
	}

	const reaction = telegram.messageReaction;
	if (!reaction || !isGroupChat(reaction.chat.type)) return;

	const delta = reaction.new_reaction.length - reaction.old_reaction.length;
	if (delta === 0) return;

	const reactions = yield* Reactions;
	yield* reactions.applyDelta(reaction.chat.id, reaction.message_id, delta);
}).pipe(
	Effect.catchAll((error) =>
		Effect.sync(() => logger.warn("reactionTracker failed", error)),
	),
);
