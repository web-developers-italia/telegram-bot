// Rileva i membri inattivi da members_activity e scrive la lista di candidati
// al kick in moderation/pending-kicks.json (alla radice della repo), da cui
// .github/workflows/inactive-cleanup.yml apre una PR di review.
// Uso: gira in GitHub Actions con ADC (Workload Identity Federation), cwd = functions/.

import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { selectInactive, THRESHOLD_DAYS } from "../src/moderation/inactive.js";

initializeApp();

const nowMs = Date.now();
const cutoff = Timestamp.fromMillis(
	nowMs - THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
);

const snapshot = await getFirestore()
	.collection("members_activity")
	.where("lastActivity", "<", cutoff)
	.get();

const rows = snapshot.docs.map((doc) => {
	const data = doc.data();
	const lastActivity = data.lastActivity as Timestamp;
	return {
		userId: Number(doc.id),
		username: (data.username as string | null) ?? null,
		lastActivityMs: lastActivity.toMillis(),
	};
});

const pending = {
	generatedAt: new Date(nowMs).toISOString(),
	thresholdDays: THRESHOLD_DAYS,
	candidates: selectInactive(rows, nowMs),
};

const outPath = path.resolve("..", "moderation", "pending-kicks.json");
await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(pending, null, "\t")}\n`);

console.log(`Candidati al kick: ${pending.candidates.length}`);
