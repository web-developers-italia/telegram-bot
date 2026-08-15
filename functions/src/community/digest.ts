export type TopMessage = {
	readonly chatId: number;
	readonly messageId: number;
	readonly reactions: number;
};

/** Link diretto a un messaggio: gruppo pubblico con username, il link funziona per chiunque. */
export const messageLink = (messageId: number): string =>
	`https://t.me/webdevitalia/${messageId}`;

/** Righe sopra soglia, dalla più reagita, tagliate a `limit`. */
export const selectTop = (
	rows: readonly TopMessage[],
	limit: number,
	minReactions: number,
): readonly TopMessage[] =>
	rows
		.filter((row) => row.reactions >= minReactions)
		.toSorted((a, b) => b.reactions - a.reactions)
		.slice(0, limit);

/** Testo del digest per il gruppo. Stringa vuota se non c'è nulla sopra soglia. */
export const digestText = (top: readonly TopMessage[]): string => {
	if (top.length === 0) return "";

	const lines = top.map(
		(row, index) =>
			`${index + 1}. ${row.reactions} reazioni - ${messageLink(row.messageId)}`,
	);

	return ["🔥 I messaggi più reagiti del gruppo", "", ...lines].join("\n");
};

/** Versione discorsiva per un post LinkedIn. Stringa vuota se non c'è nulla sopra soglia. */
export const linkedinText = (top: readonly TopMessage[]): string => {
	if (top.length === 0) return "";

	const lines = top.map((row) => `- ${messageLink(row.messageId)}`);

	return [
		"Le conversazioni più apprezzate di recente in Web Developers Italia:",
		"",
		...lines,
		"",
		"Unisciti alla community: https://t.me/webdevitalia",
	].join("\n");
};
