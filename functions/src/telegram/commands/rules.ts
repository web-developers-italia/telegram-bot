import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";
import type { CommandsProtocol } from "../CommandsProtocol";
import { escapeForTelegram } from "../utils";

export const rules: CommandsProtocol<Message> = function(context: Context): Promise<Message> {
  const replyTo: number | undefined = context.message?.message_id;

  const reply: string = `
*Regolamento*:

✅ Richieste di supporto *solo se specifiche, chiare, concise e accompagnate dalle soluzioni già provate*.

❌ Richieste di aiuto in privato.

✅ Offerte di lavoro *solo se accompagnate da tipo di contratto e range di retribuzione* \\(o budget\\).

❌ Spam di qualsiasi forma nel flusso di chat.

✅ Discussioni su news, lavoro e lifestyle del web developer e affini.

❌ Gore, porno, nudità e tutto ciò che può urtare la sensibilità dei membri del gruppo. Valido anche per le foto profilo.

✅ Richieste di supporto inerenti allo sviluppo web professionale.

❌ Abuso di sticker e messaggi vocali.

✅ Codice condiviso tramite strumenti specifici \\(Pastebin, Codepen, Stackblitz\\) e screenshot nitidi.

❌ Mandare messaggi con canali invece del proprio profilo personale.

✅ Richieste di supporto per riuscire a risolvere autonomamente esercizi scolastici.

Gli utenti sono tenuti a evitare comportamenti socialmente inadeguati, al fine di mantenere stabile e positiva la comunicazione nella chat.

[Contribuisci al gruppo su Github](https://github.com/${process.env.ORG_NAME}/${process.env.REPOSITORY_NAME})
`;

  return context.reply(escapeForTelegram(reply), {
    reply_to_message_id: replyTo || undefined,
    parse_mode: "MarkdownV2",
    disable_web_page_preview: true,
  });
}

rules.triggers = ["/regolamento", "/regole", "/rules"];