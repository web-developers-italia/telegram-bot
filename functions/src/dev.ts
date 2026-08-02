import { createBot } from "./telegram/createBot.js";

// Fallback per caricare .env se lo strumento con cui viene lanciato questo
// script non supporta il flag nativo --env-file(-if-exists) di Node.
try {
	process.loadEnvFile?.(".env");
} catch {
	// .env assente: va bene, si può passare TELEGRAM_BOT_KEY anche via ambiente.
}

const token = process.env.TELEGRAM_BOT_KEY;

if (!token) {
	console.error(
		"TELEGRAM_BOT_KEY mancante.\n" +
			"Crea un file .env in functions/ con:\n" +
			"  TELEGRAM_BOT_KEY=<token da BotFather>\n" +
			"oppure esportala nell'ambiente prima di lanciare `npm run dev`.",
	);
	process.exit(1);
}

const bot = createBot(token);

bot.start({
	allowed_updates: ["message", "chat_member"],
	onStart: (me) => console.log(`@${me.username} in polling…`),
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
	process.on(signal, () => {
		void bot.stop();
	});
}
