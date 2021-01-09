import * as functions from 'firebase-functions';
import { Telegraf, Extra } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context';
import { ExtraEditMessage } from 'telegraf/typings/telegram-types';

const bot: Telegraf<TelegrafContext> = new Telegraf(functions.config().telegram.key)

// Admin alias
bot.hears('@admin', (context: TelegrafContext) => context.reply('@scaccogatto', context.message ? Extra.inReplyTo(context.message.message_id).markup(true) : undefined))

// rules
bot.hears(['/regolamento', '/regole', '/rules'], (context: TelegrafContext) => {
  const extra: ExtraEditMessage = context.message ?
    Extra.inReplyTo(context.message.message_id).markdown().webPreview(false).markup(true) :
    Extra.markdown().webPreview(false).markup(true)
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
})

// contribute
bot.hears(['/contribute'], (context: TelegrafContext) => {
  const extra: ExtraEditMessage = context.message ?
    Extra.inReplyTo(context.message.message_id).markdown().webPreview(false).markup(true) :
    Extra.markdown().webPreview(false).markup(true)
  return context.reply(`Contribuisci al gruppo: https://github.com/insieme-dev/community`, extra)
})

exports.bot = functions
  .region('europe-west1')
  .https
  .onRequest((req, res) => bot.handleUpdate(req.body, res).then(rv => !rv && res.sendStatus(200)))
