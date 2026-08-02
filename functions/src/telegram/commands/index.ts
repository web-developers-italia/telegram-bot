import type { Command } from "../CommandsProtocol.js";
import { admin } from "./admin.js";
import { contribute } from "./contribute.js";
import { dontasktoask } from "./dontasktoask.js";
import { learn } from "./learn.js";
import { pong } from "./pong.js";
import { rielabora } from "./rielabora.js";
import { rules } from "./rules.js";
import { stats } from "./stats.js";

export const commands: readonly Command[] = [
	pong,
	rules,
	learn,
	dontasktoask,
	admin,
	contribute,
	rielabora,
	stats,
];
