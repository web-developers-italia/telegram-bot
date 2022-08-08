import { Context } from "telegraf";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import type { Update } from "telegraf/types";

export const setLastMemberActivity = (
  context: Context<Update.MessageUpdate>
) => {
  return getFirestore()
    .collection("members_activity")
    .doc(context.update.message.from.id.toString())
    .set(
      {
        username: context.message.from.username || null,
        lastActivity: Timestamp.now(),
      },
      { merge: true }
    );
};
