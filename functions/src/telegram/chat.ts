/** true per gruppi e supergruppi Telegram, false per chat private o canali. */
export const isGroupChat = (chatType: string | undefined): boolean =>
	chatType === "group" || chatType === "supergroup";
