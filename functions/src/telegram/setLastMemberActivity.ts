import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

export const setLastMemberActivity = (
  context: Context<Update.MessageUpdate>
) => {
  return getFirestore().collection("members_activity")
    .doc(context.update.message.from.id.toString())
    .set(
      {
        username: context.message.from.username || null,
        lastActivity: Timestamp.now(),
      },
      { merge: true }
    );
};
