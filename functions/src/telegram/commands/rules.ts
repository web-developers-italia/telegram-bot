import { promises as fs } from "node:fs";
import * as path from "node:path";
import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";

export async function rules(context: Context): Promise<Message> {
  const replyTo: number | undefined = context.message?.message_id;

  const rules = await fs.readFile(
    path.resolve(__dirname, "rules.txt"),
    "utf-8"
  );

  return context.reply(
    `
${rules}

[Contribuisci al gruppo su Github](https://github\\.com/${process.env.REPOSITORY_NAME?.replaceAll('-', '\\-')})
`,
    {
      reply_to_message_id: replyTo || undefined,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }
  );
}
