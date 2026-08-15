import { Effect, Layer } from "effect";
import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions/logger";
import { StorageError } from "../telegram/errors.js";
import { expiryFrom } from "./MembersLive.js";
import { Referrals } from "./Referrals.js";

const ensureApp = () => {
	if (getApps().length === 0) initializeApp();
};

// La classifica (scripts/referral-ranking.ts) è di fatto "trimestrale": il TTL
// a 90 giorni su expiresAt fa decadere i contatori dei referrer inattivi, non
// c'è nessun reset esplicito da schedulare a parte.
export const ReferralsLive = Layer.sync(Referrals, () => {
	ensureApp();
	const referrals = getFirestore().collection("referrals");

	return {
		linkFor: (userId) =>
			Effect.tryPromise({
				try: () => referrals.doc(userId.toString()).get(),
				catch: (cause) => new StorageError({ cause }),
			}).pipe(Effect.map((doc) => doc.get("inviteLink") as string | undefined)),

		saveLink: (userId, username, url) =>
			Effect.tryPromise(() =>
				referrals.doc(userId.toString()).set(
					{
						username: username ?? null,
						inviteLink: url,
						updatedAt: FieldValue.serverTimestamp(),
						expiresAt: Timestamp.fromDate(expiryFrom(Date.now())),
					},
					{ merge: true },
				),
			).pipe(
				Effect.catchAll((error) =>
					Effect.sync(() => logger.warn("referrals link write failed", error)),
				),
				Effect.asVoid,
			),

		recordJoinVia: (referrerId) =>
			Effect.tryPromise(() =>
				referrals.doc(referrerId.toString()).set(
					{
						invites: FieldValue.increment(1),
						updatedAt: FieldValue.serverTimestamp(),
						expiresAt: Timestamp.fromDate(expiryFrom(Date.now())),
					},
					{ merge: true },
				),
			).pipe(
				Effect.catchAll((error) =>
					Effect.sync(() => logger.warn("referrals join write failed", error)),
				),
				Effect.asVoid,
			),
	};
});
