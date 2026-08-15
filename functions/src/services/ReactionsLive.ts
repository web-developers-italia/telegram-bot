import { Effect, Layer } from "effect";
import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions/logger";
import { expiryFrom } from "./MembersLive.js";
import { Reactions } from "./Reactions.js";

const ensureApp = () => {
	if (getApps().length === 0) initializeApp();
};

const docId = (chatId: number, messageId: number): string =>
	`${chatId}_${messageId}`;

export const ReactionsLive = Layer.sync(Reactions, () => {
	ensureApp();
	const db = getFirestore();
	const reactions = db.collection("message_reactions");

	return {
		// Transaction (non un semplice FieldValue.increment) perché il conteggio
		// non deve mai scendere sotto 0, anche in caso di update mancati/fuori ordine.
		applyDelta: (chatId, messageId, delta) =>
			Effect.tryPromise(() =>
				db.runTransaction(async (tx) => {
					const ref = reactions.doc(docId(chatId, messageId));
					const current = (await tx.get(ref)).get("reactions") as
						number | undefined;

					tx.set(
						ref,
						{
							chatId,
							messageId,
							reactions: Math.max(0, (current ?? 0) + delta),
							updatedAt: FieldValue.serverTimestamp(),
							expiresAt: Timestamp.fromDate(expiryFrom(Date.now())),
						},
						{ merge: true },
					);
				}),
			).pipe(
				Effect.catchAll((error) =>
					Effect.sync(() =>
						logger.warn("message_reactions delta write failed", error),
					),
				),
				Effect.asVoid,
			),

		setCount: (chatId, messageId, count) =>
			Effect.tryPromise(() =>
				reactions.doc(docId(chatId, messageId)).set(
					{
						chatId,
						messageId,
						reactions: Math.max(0, count),
						updatedAt: FieldValue.serverTimestamp(),
						expiresAt: Timestamp.fromDate(expiryFrom(Date.now())),
					},
					{ merge: true },
				),
			).pipe(
				Effect.catchAll((error) =>
					Effect.sync(() =>
						logger.warn("message_reactions count write failed", error),
					),
				),
				Effect.asVoid,
			),
	};
});
