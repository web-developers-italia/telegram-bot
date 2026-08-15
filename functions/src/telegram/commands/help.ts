import { fmt, FormattedString } from "@grammyjs/parse-mode";
import { staticCommand, type Command } from "../CommandsProtocol.js";
import { commands } from "./index.js";

const commandLine = (command: Command): string => {
	const trigger = command.triggers.find((t) => t.startsWith("/"));
	return `${trigger} - ${command.description}`;
};

/** Costruisce il testo di /help dall'array dei comandi registrati. Esportata per i test. */
export const helpText = (list: readonly Command[]): FormattedString =>
	fmt`${FormattedString.bold("Comandi disponibili")}

${list
	.filter((command) => command.description)
	.map(commandLine)
	.join("\n")}`;

// Thunk lazy: index.ts importa help.ts e help.ts importa `commands` da index.ts.
// Al momento in cui questo modulo viene valutato il binding `commands` non è
// ancora popolato; risolvendolo dentro la funzione (chiamata solo a runtime,
// quando arriva /help) il ciclo di import ESM si risolve correttamente.
export const help = staticCommand(
	["/help", "/comandi"],
	() => helpText(commands),
	{
		description: "elenco dei comandi disponibili",
	},
);
