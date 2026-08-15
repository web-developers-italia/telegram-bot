import { staticCommand } from "../CommandsProtocol.js";

const text = `Leggi questo per favore e poi rielabora la tua domanda:
🇮🇹 https://nonchiederedichiedere.com
🇺🇸 https://dontasktoask.com`;

export const dontasktoask = staticCommand(
	["/dontasktoask", "/nonchiederedichiedere"],
	text,
	{
		preferRepliedMessage: true,
		description: "come chiedere aiuto nel modo giusto",
	},
);
