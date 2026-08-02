import { Context, Effect } from "effect";

export type MembersService = {
	/** Registra l'attività di un membro. Non fallisce mai: il tracking non deve rompere il flusso dei messaggi. */
	readonly touch: (
		userId: number,
		username: string | undefined,
	) => Effect.Effect<void>;
};

export class Members extends Context.Tag("Members")<
	Members,
	MembersService
>() {}
