import * as functions from "firebase-functions";
import { Telegraf, Context } from "telegraf";
import { rules } from "./commands/rules";
import { rielabora } from "./commands/rielabora";
import { contribute } from "./commands/contribute";
import { admin } from "./commands/admin";
import { dontasktoask } from "./commands/dontasktoask";
import { learn } from "./commands/learn";
import { setLastMemberActivity } from "./setLastMemberActivity";
import { pong } from "./commands/pong";
import { addUsernameCommand } from "./utils";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TELEGRAM_BOT_KEY: string;
		}
	}
}

const telegramBot: Telegraf<Context> = new Telegraf(
	process.env.TELEGRAM_BOT_KEY,
);

telegramBot.hears(["@admin", "/admin"].map(addUsernameCommand).flat(), admin);

telegramBot.hears(
	["/regolamento", "/regole", "/rules"].map(addUsernameCommand).flat(),
	rules,
);

telegramBot.hears(
	["/contribute", "/contribuisci"].map(addUsernameCommand).flat(),
	contribute,
);

telegramBot.hears(
	["/dontasktoask", "/nonchiederedichiedere"].map(addUsernameCommand).flat(),
	dontasktoask,
);

telegramBot.hears(["/rielabora"].map(addUsernameCommand).flat(), rielabora);

telegramBot.hears(["/learn"].map(addUsernameCommand).flat(), learn);

telegramBot.hears(["/ping"].map(addUsernameCommand).flat(), pong);

telegramBot.on("message", setLastMemberActivity);

export const bot = functions
	.region("europe-west1")
	.https.onRequest((req, res) => {
		telegramBot.handleUpdate(req.body, res);
		res.sendStatus(200);
	});
