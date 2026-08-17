import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export const currentProfile = async () => {
  const userId = await getSessionUserId();

  if (!userId) {
    return null;
  }

  const profile = await db.profile.findUnique({
    where: { userId },
  });

  return profile;
};
