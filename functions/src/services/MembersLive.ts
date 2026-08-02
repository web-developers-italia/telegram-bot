import { Effect, Layer } from "effect";
import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/logger";
import { Members } from "./Members.js";

const ensureApp = () => {
	if (getApps().length === 0) initializeApp();
};

export const MembersLive = Layer.sync(Members, () => {
	ensureApp();
	const collection = getFirestore().collection("members_activity");

	return {
		touch: (userId, username) =>
			Effect.tryPromise(() =>
				collection.doc(userId.toString()).set(
					{
						username: username ?? null,
						lastActivity: FieldValue.serverTimestamp(),
					},
					{ merge: true },
				),
			).pipe(
				Effect.catchAll((error) =>
					Effect.sync(() =>
						logger.warn("members_activity write failed", error),
					),
				),
				Effect.asVoid,
			),
	};
});
