import { TelegrafContext } from "telegraf/typings/context";
import { ExtraEditMessage, Message } from "telegraf/typings/telegram-types";
import { Extra } from "telegraf";

export function sendRules(context: TelegrafContext, replyTo?: number | null): Promise<Message> {
    const extra: ExtraEditMessage = replyTo ?
        Extra.inReplyTo(replyTo).markdown().webPreview(false).markup(true) :
        Extra.markdown().webPreview(false).markup(true);

    return context.reply(`Regolamento:

  \`\`\`
  - [Sì] alle richieste di supporto solo se specifiche, chiare, concise e accompagnate dalle soluzioni già provate

  - [Sì] alle offerte di lavoro solo se accompagnate da tipo di contratto e range di retribuzione

  - [Sì] discussione su news, lavoro e lifestyle del web-developer e affini

  - [No] richieste di supporto non inerenti al development, nessuno qui riparerà la tua stampante

  - [No] incollare codice direttamente in chat

  - [No] spam di qualsiasi forma nel flusso di chat

  - [No] foto agli schermi, sono accettati screenshot

  - [No] gore e porno
  \`\`\`

  Contribuisci al gruppo: https://github.com/insieme-dev/community`, extra)
}