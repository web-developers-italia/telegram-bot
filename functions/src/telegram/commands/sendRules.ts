import { TelegrafContext } from "telegraf/typings/context";
import { ExtraEditMessage, Message } from "telegraf/typings/telegram-types";
import { Extra } from "telegraf";

export function sendRules(
  context: TelegrafContext,
  replyTo?: number | null
): Promise<Message> {
  const extra: ExtraEditMessage = replyTo
    ? Extra.inReplyTo(replyTo).markdown().webPreview(false).markup(true)
    : Extra.markdown().webPreview(false).markup(true);

  return context.reply(
    `
Regolamento:
\`\`\`
  - [✅] Richieste di supporto solo se specifiche, chiare, concise e accompagnate dalle soluzioni già provate

    Va bene la pigrizia, ma il gruppo non è qui per imboccarvi la soluzione. Siate pro-attivi.

  - [✅] Offerte di lavoro **solo se accompagnate da tipo di contratto e range di retribuzione** (o budget)

    Il vostro messaggio verrà cancellato in caso contrario.

  - [✅] Discussioni su news, lavoro e lifestyle del web-developer e affini;

  - [❌] Richieste di aiuto in privato.
  
    Il gruppo è qui per aiutare e per parlare. No, non è vero che intaserai il flusso di chat con i tuoi problemi se chiedi dentro al gruppo.
    Scrivere in privato significa chiedere a qualcuno di prendersi la responsabilità di risponderti e di risolvere il tuo problema.

  - [❌] Richieste di supporto per esercizi assegnati da docenti o corsi scolastici.

    E' possibile, ed è ben accetta, la possibilità di richiedere risorse da studiare per arrivare alla risoluzione del problema in maniera quasi autonoma.

  - [❌] Richieste di supporto non inerenti allo sviluppo web.

    Nessuno qui riparerà la tua stampante o ti aiuterà a creare il plugin per il tuo server Minecraft

  - [❌] Incollare codice direttamente in chat (si fanno eccezioni per snippet brevi).

    Si richiede di utilizzare servizi come Pastebin, Codepen o Stackblitz in modo da aiutare chi decide di aiutare.

  - [❌] Spam di qualsiasi forma nel flusso di chat

  - [❌] Foto agli schermi. Sono accettati screenshot.
  
    Imparate ad usare gli strumenti della vostra macchina.

  - [❌] Gore, porno, nudità e tutto ciò che può urtare la sensibilità dei membri del gruppo.
  
    Sono incluse le foto profilo. Nel gruppo sono presenti membri minorenni.

  - [❌] Mandare messaggi con canali invece del proprio profilo personale
  
Gli utenti sono tenuti a evitare comportamenti adeguati al fine di mantenere stabile la situazione nella chat.
Gli amministratori possono bandire qualunque membro dalla chat qualora possa venir identificato come potenziale problema. Nessuno deve spiegazioni a nessuno.

\`\`\`

  Contribuisci al gruppo: https://github.com/insieme-dev/community`,
    extra
  );
}
