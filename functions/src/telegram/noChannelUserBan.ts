import type { Context } from "telegraf";

export const noChannelUserBan = async (context: Context) => {
	if (context.message?.from.username !== "Channel_Bot") {
		return;
	}

	if (!context.message.sender_chat) {
		return;
	}

	await Promise.all([
		context.banChatSenderChat(context.message.sender_chat.id),
		context.deleteMessage(context.message.message_id),
	]);

	return context.replyWithMarkdownV2(
		`_Un messaggio inviato da un canale è stato eliminato per violazione delle regole\\._`,
	);
};
