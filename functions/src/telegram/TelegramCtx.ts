import type { FormattedString } from "@grammyjs/parse-mode";
import { Context as EffectContext, Effect } from "effect";
import type {
	ChatInviteLink,
	ChatMember,
	ChatMemberUpdated,
	Message,
	MessageReactionCountUpdated,
	MessageReactionUpdated,
} from "grammy/types";
import type { Context, InlineKeyboard } from "grammy";
import { TelegramApiError } from "./errors.js";

export type ReplyOptions = {
	readonly replyTo?: number;
	readonly disablePreview?: boolean;
	readonly replyMarkup?: InlineKeyboard;
};

/**
 * Porta stretta verso Telegram: i comandi dipendono da questa interfaccia,
 * mai dal Context grammY grezzo. I mock nei test implementano solo questo.
 */
export type TelegramCtxService = {
	readonly message: Message | undefined;
	readonly chatType: string | undefined;
	/** Payload di un comando (es. `/start regole` -> "regole"); vuoto/undefined se assente. */
	readonly commandPayload: string | undefined;
	/** Update chat_member (join/left/kick/promote): assente per gli update normali (message). */
	readonly chatMemberUpdate: ChatMemberUpdated | undefined;
	/** Update message_reaction (reazione di un utente non anonimo): assente per gli update normali. */
	readonly messageReaction: MessageReactionUpdated | undefined;
	/** Update message_reaction_count (conteggio aggregato, reazioni anonime): assente per gli update normali. */
	readonly messageReactionCount: MessageReactionCountUpdated | undefined;
	readonly reply: (
		text: string | FormattedString,
		options?: ReplyOptions,
	) => Effect.Effect<Message, TelegramApiError>;
	readonly deleteMessage: (
		messageId: number,
	) => Effect.Effect<void, TelegramApiError>;
	readonly banChatSenderChat: (
		senderChatId: number,
	) => Effect.Effect<void, TelegramApiError>;
	readonly getChatAdministrators: () => Effect.Effect<
		readonly ChatMember[],
		TelegramApiError
	>;
	/** Crea un nuovo invite link per la chat corrente (richiede il bot admin con diritto d'invito). */
	readonly createChatInviteLink: (
		name: string,
	) => Effect.Effect<ChatInviteLink, TelegramApiError>;
};

export class TelegramCtx extends EffectContext.Tag("TelegramCtx")<
	TelegramCtx,
	TelegramCtxService
>() {}

const call = <A>(method: string, run: () => Promise<A>) =>
	Effect.tryPromise({
		try: run,
		catch: (cause) => new TelegramApiError({ method, cause }),
	});

const isFormatted = (text: string | FormattedString): text is FormattedString =>
	typeof text !== "string";

/** Adatta il Context grammY alla porta stretta, una volta sola per update. */
export const makeTelegramCtx = (ctx: Context): TelegramCtxService => ({
	message: ctx.message,
	chatType: ctx.chat?.type,
	commandPayload: typeof ctx.match === "string" ? ctx.match : undefined,
	chatMemberUpdate: ctx.chatMember,
	messageReaction: ctx.messageReaction,
	messageReactionCount: ctx.messageReactionCount,
	reply: (text, options) =>
		call("sendMessage", () =>
			ctx.reply(isFormatted(text) ? text.text : text, {
				entities: isFormatted(text) ? text.entities : undefined,
				reply_parameters:
					options?.replyTo === undefined
						? undefined
						: { message_id: options.replyTo },
				link_preview_options: options?.disablePreview
					? { is_disabled: true }
					: undefined,
				reply_markup: options?.replyMarkup,
			}),
		),
	deleteMessage: (messageId) =>
		call("deleteMessage", () =>
			ctx.api.deleteMessage(ctx.chatId as number, messageId),
		).pipe(Effect.asVoid),
	banChatSenderChat: (senderChatId) =>
		call("banChatSenderChat", () => ctx.banChatSenderChat(senderChatId)).pipe(
			Effect.asVoid,
		),
	getChatAdministrators: () =>
		call("getChatAdministrators", () => ctx.getChatAdministrators()),
	createChatInviteLink: (name) =>
		call("createChatInviteLink", () => ctx.createChatInviteLink({ name })),
});
