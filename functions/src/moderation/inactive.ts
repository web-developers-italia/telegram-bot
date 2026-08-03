const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// DEVE restare < 90 (retention/TTL di members_activity): se la soglia arrivasse
// a 90gg o oltre, il TTL di Firestore avrebbe già cancellato i documenti degli
// inattivi prima che questo job possa rilevarli.
export const THRESHOLD_DAYS = 60;

export type Candidate = {
	userId: number;
	username: string | null;
	lastActivityIso: string;
};

export type PendingKicks = {
	generatedAt: string;
	thresholdDays: number;
	candidates: Candidate[];
};

export const emptyPending = (
	nowIso: string,
	thresholdDays: number,
): PendingKicks => ({
	generatedAt: nowIso,
	thresholdDays,
	candidates: [],
});

/** Righe di members_activity oltre la soglia di inattività, dalla più vecchia. */
export const selectInactive = (
	rows: ReadonlyArray<{
		userId: number;
		username: string | null;
		lastActivityMs: number;
	}>,
	nowMs: number,
	thresholdDays: number = THRESHOLD_DAYS,
): Candidate[] => {
	const cutoffMs = nowMs - thresholdDays * ONE_DAY_MS;

	return rows
		.filter((row) => row.lastActivityMs < cutoffMs)
		.sort((a, b) => a.lastActivityMs - b.lastActivityMs)
		.map((row) => ({
			userId: row.userId,
			username: row.username,
			lastActivityIso: new Date(row.lastActivityMs).toISOString(),
		}));
};
