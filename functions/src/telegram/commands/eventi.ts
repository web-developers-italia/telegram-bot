import { fmt, FormattedString } from "@grammyjs/parse-mode";
import {
	events,
	formatEventDate,
	upcomingEvents,
	type CommunityEvent,
} from "../../community/events.js";
import { staticCommand } from "../CommandsProtocol.js";

const eventLine = (event: CommunityEvent): FormattedString => {
	const title = event.url
		? FormattedString.link(event.title, event.url)
		: new FormattedString(event.title);

	return fmt`• ${title} - ${formatEventDate(event.startsAtIso)}`;
};

/** Costruisce il testo di /eventi dalla lista di eventi della community. Esportata per i test. */
export const eventiText = (
	list: readonly CommunityEvent[],
	nowMs: number,
): FormattedString => {
	const next = upcomingEvents(list, nowMs);

	if (next.length === 0)
		return new FormattedString(
			"Nessun evento in programma al momento. Vuoi proporne uno? Parlane nel gruppo o apri una issue con /contribute.",
		);

	return fmt`${FormattedString.bold("Prossimi eventi")}

${FormattedString.join(next.map(eventLine), "\n")}`;
};

// Thunk lazy: Date.now() deve essere valutato quando arriva /eventi, non al
// caricamento del modulo (altrimenti "ora" resterebbe congelato all'avvio).
export const eventi = staticCommand(
	["/eventi", "/events"],
	() => eventiText(events, Date.now()),
	{ description: "prossimi eventi della community" },
);
