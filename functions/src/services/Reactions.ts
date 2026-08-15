import { Context, Effect } from "effect";

export type ReactionsService = {
	/** Applica un delta (+/-) al conteggio reazioni di un messaggio. Non fallisce mai. */
	readonly applyDelta: (
		chatId: number,
		messageId: number,
		delta: number,
	) => Effect.Effect<void>;
	/** Imposta il conteggio assoluto di reazioni di un messaggio (reazioni anonime). Non fallisce mai. */
	readonly setCount: (
		chatId: number,
		messageId: number,
		count: number,
	) => Effect.Effect<void>;
};

export class Reactions extends Context.Tag("Reactions")<
	Reactions,
	ReactionsService
>() {}
