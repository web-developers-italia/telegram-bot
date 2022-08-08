/**
 * This file describes the interface all the commands should comply with.
 */

import { Context } from "telegraf";

export interface CommandsProtocol<ReturnType = unknown> {
	(context: Context): Promise<ReturnType>;
	triggers: string[];
}