import * as functions from 'firebase-functions';
import { Telegraf, Extra } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context';
import { ExtraEditMessage } from 'telegraf/typings/telegram-types';
import { sendRules } from "./commands/sendRules";

const bot: Telegraf<TelegrafContext> = new Telegraf(functions.config().telegram.key)

// Admin alias
bot.hears('@admin', (context: TelegrafContext) => context.reply('@scaccogatto', context.message ? Extra.inReplyTo(context.message.message_id).markup(true) : undefined))

// rules
bot.hears(['/regolamento', '/regole', '/rules'], (context: TelegrafContext) => sendRules(context, context.message?.message_id))

// contribute
bot.hears(['/contribute'], (context: TelegrafContext) => {
  const extra: ExtraEditMessage = context.message ?
    Extra.inReplyTo(context.message.message_id).markdown().webPreview(false).markup(true) :
    Extra.markdown().webPreview(false).markup(true)
  return context.reply(`Contribuisci al gruppo: https://github.com/insieme-dev/community`, extra)
})

bot.hears(['/dontasktoask'], (context: TelegrafContext) => {
  const messageReplyTarget = context.message?.reply_to_message?.message_id ?? context.message?.message_id

  const extra: ExtraEditMessage = messageReplyTarget ?
    Extra.inReplyTo(messageReplyTarget).markdown().webPreview(false).markup(true) :
    Extra.markdown().webPreview(false).markup(true)

  return context.reply(`Leggi questo per favore e poi rielabora la tua domanda: https://dontasktoask.com (ENG)`, extra)
})

bot.hears(['/rielabora'], async (context: TelegrafContext) => {
  const {message_id, from} = context.message?.reply_to_message ?? context.message ?? {};

  if (from && message_id) {
    const rulesMessage = await sendRules(context);
    await context.deleteMessage(message_id);

    const extra = from.username
      ? Extra.webPreview(false).markup(true)
      : Extra.webPreview(false).markdown(true);

    const mention = from.username
      ? `@${from.username}`
      : `[${from.first_name}](tg://user?id=${from.id})`;

    return context.reply(
      `${mention} leggi le regole e poi rielabora la tua domanda per favore`,
      extra.inReplyTo(rulesMessage.message_id) as ExtraEditMessage
    );
  } else {
    return context;
  }
})

exports.bot = functions
  .region('europe-west1')
  .https
  .onRequest((req, res) => bot.handleUpdate(req.body, res).then(rv => !rv && res.sendStatus(200)))
