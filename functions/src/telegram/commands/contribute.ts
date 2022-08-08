import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";
import type { CommandsProtocol } from "../CommandsProtocol";
import { getIssues, getPullRequests } from "../utils";

export const contribute: CommandsProtocol<Message> = async function(context: Context) {
  return context.reply(
    `
*Tramite il repository open source, puoi amministrare il gruppo democraticamente, decidere le regole, gli amministratori e il futuro del gruppo\\.*

✍️ https://github\\.com/${process.env.REPOSITORY_NAME?.replaceAll('-', '\\-')}

Pull Request attive:
${(await getPullRequests()).join('\n')}

Issue attive:
${(await getIssues()).join('\n')}
`,
    {
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
      reply_to_message_id: context.message?.message_id ?? undefined,
    }
  );
}

contribute.triggers = ["/contribute", "/contribuisci"];