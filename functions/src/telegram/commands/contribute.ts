import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";

export function contribute(context: Context): Promise<Message> {
  return context.reply(
    `
*Tramite il repository open source, puoi amministrare il gruppo democraticamente, decidere le regole, gli amministratori e il futuro del gruppo\\.*

✍️ https://github\\.com/${process.env.REPOSITORY_NAME?.replaceAll('-', '\\-')}
`,
    {
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
      reply_to_message_id: context.message?.message_id ?? undefined,
    }
  );
}
