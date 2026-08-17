import { NextApiRequest } from "next";

import { db } from "@/lib/db";
import { getSessionUserIdFromRequest } from "@/lib/auth";

export const currentProfilePages = async (req: NextApiRequest) => {
  const userId = await getSessionUserIdFromRequest(req);

  if (!userId) {
    return null;
  }

  const profile = await db.profile.findUnique({
    where: {
      userId,
    },
  });

  return profile;
};
