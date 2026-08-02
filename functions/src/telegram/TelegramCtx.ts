import type { FormattedString } from "@grammyjs/parse-mode";
import { Context as EffectContext, Effect } from "effect";
import type { ChatMember, ChatMemberUpdated, Message } from "grammy/types";
import type { Context } from "grammy";
import { TelegramApiError } from "./errors.js";

export type ReplyOptions = {
	readonly replyTo?: number;
	readonly disablePreview?: boolean;
};

/**
 * Porta stretta verso Telegram: i comandi dipendono da questa interfaccia,
 * mai dal Context grammY grezzo. I mock nei test implementano solo questo.
 */
export type TelegramCtxService = {
	readonly message: Message | undefined;
	readonly chatType: string | undefined;
	/** Update chat_member (join/left/kick/promote): assente per gli update normali (message). */
	readonly chatMemberUpdate: ChatMemberUpdated | undefined;
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
	chatMemberUpdate: ctx.chatMember,
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
});
