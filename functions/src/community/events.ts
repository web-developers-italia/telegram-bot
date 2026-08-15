// Eventi ricorrenti della community (es. "WDI night"). Per aggiungere un
// evento: aggiungi una riga all'array `events` qui sotto via PR. Il comando
// /eventi e il reminder automatico (scripts/event-reminder.ts) lo leggono
// automaticamente, nessun altro file da toccare.
export type CommunityEvent = {
	readonly title: string;
	/** ISO 8601 con offset esplicito, es. "2026-09-10T21:00:00+02:00". */
	readonly startsAtIso: string;
	readonly url?: string;
};

export const events: readonly CommunityEvent[] = [];

const startsAtMs = (event: CommunityEvent): number =>
	new Date(event.startsAtIso).getTime();

/** Eventi futuri rispetto a nowMs, ordinati per data crescente. */
export const upcomingEvents = (
	list: readonly CommunityEvent[],
	nowMs: number,
): readonly CommunityEvent[] =>
	list
		.filter((event) => startsAtMs(event) >= nowMs)
		.sort((a, b) => startsAtMs(a) - startsAtMs(b));

/** Eventi con inizio in [nowMs, nowMs + windowMs). */
export const eventsWithin = (
	list: readonly CommunityEvent[],
	nowMs: number,
	windowMs: number,
): readonly CommunityEvent[] =>
	list.filter((event) => {
		const ms = startsAtMs(event);
		return ms >= nowMs && ms < nowMs + windowMs;
	});

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
	timeZone: "Europe/Rome",
	weekday: "short",
	day: "numeric",
	month: "long",
});
const timeFormatter = new Intl.DateTimeFormat("it-IT", {
	timeZone: "Europe/Rome",
	hour: "2-digit",
	minute: "2-digit",
});

/** Es. "gio 10 settembre, 21:00". */
export const formatEventDate = (iso: string): string => {
	const date = new Date(iso);
	return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
};
