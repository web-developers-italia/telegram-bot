import type { Context } from "telegraf";
import type { Message } from "telegraf/typings/core/types/typegram";

export function rules(
  context: Context
): Promise<Message> {
  const replyTo: number | undefined = context.message?.message_id

  return context.reply(
    `
*Regolamento*:

✅ Richieste di supporto *solo se specifiche, chiare, concise e accompagnate dalle soluzioni già provate*\\. Il gruppo non è qui per imboccarti la soluzione\\. Siate pro\\-attivi\\.

✅ Offerte di lavoro *solo se accompagnate da tipo di contratto e range di retribuzione* \\(o budget\\)\\. Pena la cancellazione del messaggio\\.

✅ Discussioni su news, lavoro e lifestyle del web developer e affini\\.

❌ Messaggi vocali\\. Ascoltare messaggi vocali può essere fastidioso, impossibile e una perdita di tempo per molte persone\\. Tutti dovrebbero essere in grado di comprenderti, soprattutto se hai bisogno di aiuto\\.

❌ Richieste di aiuto in privato\\. Il gruppo è qui per aiutare e per parlare\\. No, non intasi il flusso di chat con i tuoi problemi se chiedi qui\\. Scrivi /nonchiederedichiedere per il motivo\\.

❌ Richieste di supporto per esercizi scolastici\\. Va bene richiedere risorse per risolvere autonomamente il problema\\.

❌ Richieste di supporto non inerenti allo sviluppo web\\. Nessuno qui riparerà la tua stampante o creerà un plugin per il tuo server Minecraft\\.

❌ Incollare codice direttamente in chat \\(tranne che per snippet brevi\\)\\. Utilizza servizi come Pastebin, Codepen o Stackblitz\\.

❌ Spam di qualsiasi forma nel flusso di chat\\.

❌ Foto agli schermi\\. Sono accettati screenshot\\. Impara ad usare gli strumenti della tua macchina\\.

❌ Gore, porno, nudità e tutto ciò che può urtare la sensibilità dei membri del gruppo\\. Valido anche per le foto profilo\\. Nel gruppo sono presenti membri minorenni\\.

❌ Mandare messaggi con canali invece del proprio profilo personale\\.

Gli utenti sono tenuti a evitare comportamenti inadeguati, al fine di mantenere stabile e non tossica la situazione nella chat\\.
Gli amministratori possono bandire qualunque membro dalla chat qualora possa venir identificato come potenziale problema\\. Nessuno deve spiegazioni a nessuno\\.

[Contribuisci al gruppo su Github](https://github\\.com/${process.env.REPOSITORY_NAME?.replaceAll('-', '\\-')})
`,
    {
      reply_to_message_id: replyTo || undefined,
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }
  );
}
