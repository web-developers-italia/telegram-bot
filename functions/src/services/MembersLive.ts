import { Effect, Layer } from "effect";
import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions/logger";
import { StorageError } from "../telegram/errors.js";
import { Members } from "./Members.js";

const ensureApp = () => {
	if (getApps().length === 0) initializeApp();
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THROTTLE_MS = 15 * 60 * 1000;
const RETENTION_MS = 90 * ONE_DAY_MS;

/** Soglia di throttle per `touch`: true se l'ultima scrittura è troppo recente. */
export const shouldThrottle = (
	lastWriteMs: number | undefined,
	nowMs: number,
): boolean => lastWriteMs !== undefined && nowMs - lastWriteMs < THROTTLE_MS;

/** Scadenza TTL (+90gg), alimenta la policy Firestore creata da infra/setup-firestore-ttl.sh. */
export const expiryFrom = (nowMs: number): Date =>
	new Date(nowMs + RETENTION_MS);

// ponytail: throttle per-istanza (non condiviso tra istanze Cloud Functions);
// più istanze = qualche scrittura in più del necessario, accettabile.
const lastWrite = new Map<number, number>();

export const MembersLive = Layer.sync(Members, () => {
	ensureApp();
	const activity = getFirestore().collection("members_activity");
	const botState = getFirestore().collection("bot_state");

	return {
		touch: (userId, username) => {
			const now = Date.now();
			if (shouldThrottle(lastWrite.get(userId), now)) return Effect.void;
			lastWrite.set(userId, now);

			return Effect.tryPromise(() =>
				activity.doc(userId.toString()).set(
					{
						username: username ?? null,
						lastActivity: FieldValue.serverTimestamp(),
						expiresAt: Timestamp.fromDate(expiryFrom(now)),
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
			);
		},

		recordJoin: (userId) =>
			Effect.tryPromise(() =>
				activity.doc(userId.toString()).set(
					{
						joinedAt: FieldValue.serverTimestamp(),
						expiresAt: Timestamp.fromDate(expiryFrom(Date.now())),
					},
					{ merge: true },
				),
			).pipe(
				Effect.catchAll((error) =>
					Effect.sync(() => logger.warn("members_activity join failed", error)),
				),
				Effect.asVoid,
			),

		isRecentJoiner: (userId) =>
			Effect.tryPromise({
				try: () => activity.doc(userId.toString()).get(),
				catch: (cause) => new StorageError({ cause }),
			}).pipe(
				Effect.map((doc) => {
					const joinedAt = doc.get("joinedAt") as Timestamp | undefined;
					if (!joinedAt) return false;
					return Date.now() - joinedAt.toMillis() < ONE_DAY_MS;
				}),
			),

		activeCounts: () =>
			Effect.tryPromise({
				try: async () => {
					const now = Date.now();
					const since7 = Timestamp.fromMillis(now - 7 * ONE_DAY_MS);
					const since30 = Timestamp.fromMillis(now - 30 * ONE_DAY_MS);
					const [last7, last30] = await Promise.all([
						activity.where("lastActivity", ">", since7).count().get(),
						activity.where("lastActivity", ">", since30).count().get(),
					]);
					return { last7: last7.data().count, last30: last30.data().count };
				},
				catch: (cause) => new StorageError({ cause }),
			}),

		welcomeState: (chatId) =>
			Effect.tryPromise({
				try: () => botState.doc(`welcome_${chatId}`).get(),
				catch: (cause) => new StorageError({ cause }),
			}).pipe(
				Effect.map((doc) => {
					const data = doc.data();
					if (!data) return undefined;
					return {
						messageId: data.messageId as number,
						sentAtMs: data.sentAtMs as number,
					};
				}),
			),

		setWelcomeState: (chatId, state) =>
			Effect.tryPromise(() =>
				botState.doc(`welcome_${chatId}`).set(state),
			).pipe(
				Effect.catchAll((error) =>
					Effect.sync(() => logger.warn("welcome state write failed", error)),
				),
				Effect.asVoid,
			),
	};
});
