import { db } from "@/lib/db";
import { friendProfileSelect } from "@/lib/friends";

const conversationInclude = {
  profileOne: { select: friendProfileSelect },
  profileTwo: { select: friendProfileSelect },
} as const;

export const getOrCreateDirectConversation = async (
  profileAId: string,
  profileBId: string
) => {
  const [profileOneId, profileTwoId] = [profileAId, profileBId].sort();

  const existing = await db.directConversation.findUnique({
    where: { profileOneId_profileTwoId: { profileOneId, profileTwoId } },
    include: conversationInclude,
  });

  if (existing) {
    return existing;
  }

  try {
    return await db.directConversation.create({
      data: { profileOneId, profileTwoId },
      include: conversationInclude,
    });
  } catch {
    return db.directConversation.findUnique({
      where: { profileOneId_profileTwoId: { profileOneId, profileTwoId } },
      include: conversationInclude,
    });
  }
};

export const findDirectConversationForProfile = async (
  conversationId: string,
  profileId: string
) =>
  db.directConversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ profileOneId: profileId }, { profileTwoId: profileId }],
    },
    include: conversationInclude,
  });
