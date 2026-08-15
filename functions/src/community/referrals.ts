const LINK_NAME_PREFIX = "ref:";
const REFERRAL_LINK_NAME = /^ref:([1-9]\d*)$/;

/** Nome dell'invite link personale di un utente: codifica il referrer. */
export const inviteLinkName = (userId: number): string =>
	`${LINK_NAME_PREFIX}${userId}`;

/** Referrer da un nome di invite link, undefined se assente o non nel formato "ref:<intero positivo>". */
export const referrerFromLinkName = (
	name: string | undefined,
): number | undefined => {
	const match = name?.match(REFERRAL_LINK_NAME);
	return match ? Number(match[1]) : undefined;
};

export type ReferralRow = {
	readonly userId: number;
	readonly username: string | null;
	readonly invites: number;
};

/** Testo della classifica referral. Stringa vuota se non c'è nessuna riga. */
export const rankingText = (rows: readonly ReferralRow[]): string => {
	if (rows.length === 0) return "";

	const sorted = rows.toSorted((a, b) => b.invites - a.invites);
	const lines = sorted.map((row, index) => {
		const who = row.username ? `@${row.username}` : `utente ${row.userId}`;
		return `${index + 1}. ${who} - ${row.invites} inviti`;
	});

	return [
		"🏆 Chi ha portato più dev nel gruppo",
		"",
		...lines,
		"",
		"(contano gli inviti recenti: i contatori scadono dopo 90 giorni senza nuovi inviti)",
	].join("\n");
};
