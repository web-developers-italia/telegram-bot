import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";

export function rules(
  context: Context
): Promise<Message> {
  const replyTo: number | undefined = context.message?.message_id

  return context.reply(
    `
*Regolamento*:

✅ Richieste di supporto *solo se specifiche, chiare, concise e accompagnate dalle soluzioni già provate*\\.

✅ Offerte di lavoro *solo se accompagnate da tipo di contratto e range di retribuzione* \\(o budget\\)\\.

✅ Discussioni su news, lavoro e lifestyle del web developer e affini\\.

✅ Richieste di supporto inerenti allo sviluppo web professionale\\.

✅ Codice condiviso tramite strumenti specifici (Pastebin, Codepen, Stackblitz) e screenshot nitidi\\.

❌ Abuso di sticker e messaggi vocali\\.

❌ Richieste di aiuto in privato\\.

❌ Richieste di supporto per esercizi scolastici\\.

❌ Spam di qualsiasi forma nel flusso di chat\\.

❌ Gore, porno, nudità e tutto ciò che può urtare la sensibilità dei membri del gruppo\\. Valido anche per le foto profilo\\.

❌ Mandare messaggi con canali invece del proprio profilo personale\\.

Gli utenti sono tenuti a evitare comportamenti socialmente inadeguati, al fine di mantenere stabile e positiva la comunicazione nella chat\\.

[Contribuisci al gruppo su Github](https://github\\.com/${process.env.REPOSITORY_NAME?.replaceAll('-', '\\-')})
`,
    {
      reply_to_message_id: replyTo || undefined,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }
  );
}
