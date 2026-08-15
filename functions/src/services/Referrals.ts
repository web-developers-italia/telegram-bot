import { Context, Effect } from "effect";
import type { StorageError } from "../telegram/errors.js";

export type ReferralsService = {
	/** Link d'invito personale salvato per l'utente, se esiste. */
	readonly linkFor: (
		userId: number,
	) => Effect.Effect<string | undefined, StorageError>;
	/** Salva il link d'invito personale di un utente. Non fallisce mai. */
	readonly saveLink: (
		userId: number,
		username: string | undefined,
		url: string,
	) => Effect.Effect<void>;
	/** Attribuisce un ingresso al referrer, incrementandone il conteggio inviti. Non fallisce mai. */
	readonly recordJoinVia: (referrerId: number) => Effect.Effect<void>;
};

export class Referrals extends Context.Tag("Referrals")<
	Referrals,
	ReferralsService
>() {}
