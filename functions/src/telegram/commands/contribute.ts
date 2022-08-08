import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";
import type { CommandsProtocol } from "../CommandsProtocol";
import { escapeForTelegram, getIssues, getPullRequests } from "../utils";

export const contribute: CommandsProtocol<Message> = async function (
	context: Context,
) {
	const pullRequests = await getPullRequests();
	const issues = await getIssues();

	const reply: string = `
*Tramite il repository open source, puoi amministrare il gruppo democraticamente, decidere le regole, gli amministratori e il futuro del gruppo.*

✍️ [Contribuisci al gruppo su Github](https://github.com/${
		process.env.ORG_NAME
	}/${process.env.REPOSITORY_NAME})

${
	pullRequests.length > 0
		? `Pull Request attive:
${pullRequests.map(toReadableText).join("\n")}
`
		: ""
}
${
	issues.length > 0
		? `Issue attive:
${issues.map(toReadableText).join("\n")}`
		: ""
}
`;

	return context.reply(escapeForTelegram(reply), {
		parse_mode: "MarkdownV2",
		disable_web_page_preview: true,
		reply_to_message_id: context.message?.message_id ?? undefined,
	});
};

const toReadableText = ({
	number,
	title,
	html_url,
}: {
	number: number;
	title: string;
	html_url: string;
}) => {
	return `[#${number} - ${title}](${html_url})`;
};

contribute.triggers = ["/contribute", "/contribuisci"];
