import { Context, Effect } from "effect";
import type { StorageError } from "../telegram/errors.js";

export type WelcomeState = {
	readonly messageId: number;
	readonly sentAtMs: number;
};

export type MembersService = {
	/** Registra l'attività di un membro. Non fallisce mai: il tracking non deve rompere il flusso dei messaggi. */
	readonly touch: (
		userId: number,
		username: string | undefined,
	) => Effect.Effect<void>;
	/** Registra l'ingresso di un membro (euristica anti-spam). Non fallisce mai. */
	readonly recordJoin: (userId: number) => Effect.Effect<void>;
	/** True se il membro è entrato nel gruppo nelle ultime 24 ore. */
	readonly isRecentJoiner: (
		userId: number,
	) => Effect.Effect<boolean, StorageError>;
	/** Conteggio membri con attività recente. */
	readonly activeCounts: () => Effect.Effect<
		{ readonly last7: number; readonly last30: number },
		StorageError
	>;
	/** Stato dell'ultimo messaggio di benvenuto inviato nel gruppo, se presente. */
	readonly welcomeState: (
		chatId: number,
	) => Effect.Effect<WelcomeState | undefined, StorageError>;
	/** Registra lo stato del messaggio di benvenuto. Non fallisce mai. */
	readonly setWelcomeState: (
		chatId: number,
		state: WelcomeState,
	) => Effect.Effect<void>;
};

export class Members extends Context.Tag("Members")<
	Members,
	MembersService
>() {}
