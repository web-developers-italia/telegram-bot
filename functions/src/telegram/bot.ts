import * as functions from "firebase-functions";
import { Telegraf, Context } from "telegraf";
import { bindCommands } from "./bindCommands";
import { noChannelUserBan } from "./noChannelUserBan";
import { setLastMemberActivity } from "./setLastMemberActivity";

const telegramBot: Telegraf<Context> = new Telegraf(
	process.env.TELEGRAM_BOT_KEY || "",
);

bindCommands(telegramBot);
telegramBot.on("message", setLastMemberActivity);
telegramBot.on("message", noChannelUserBan);

export const bot = functions
	.region("europe-west1")
	.https.onRequest(
		async (req: functions.https.Request, res: functions.Response<any>) => {
			telegramBot.handleUpdate(req.body, res);
			res.sendStatus(200);
		},
	);
