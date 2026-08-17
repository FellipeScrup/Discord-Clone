import { db } from "@/lib/db";

export const friendProfileSelect = {
  id: true,
  name: true,
  username: true,
  imageUrl: true,
} as const;

export const getFriendshipsForProfile = async (profileId: string) => {
  const friendships = await db.friendship.findMany({
    where: {
      OR: [{ requesterId: profileId }, { addresseeId: profileId }],
    },
    include: {
      requester: { select: friendProfileSelect },
      addressee: { select: friendProfileSelect },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    friends: friendships
      .filter((friendship) => friendship.status === "ACCEPTED")
      .map((friendship) => ({
        friendshipId: friendship.id,
        profile:
          friendship.requesterId === profileId
            ? friendship.addressee
            : friendship.requester,
      })),
    incoming: friendships
      .filter(
        (friendship) =>
          friendship.status === "PENDING" && friendship.addresseeId === profileId
      )
      .map((friendship) => ({
        friendshipId: friendship.id,
        profile: friendship.requester,
      })),
    outgoing: friendships
      .filter(
        (friendship) =>
          friendship.status === "PENDING" && friendship.requesterId === profileId
      )
      .map((friendship) => ({
        friendshipId: friendship.id,
        profile: friendship.addressee,
      })),
  };
};

export const areFriends = async (profileId: string, otherProfileId: string) => {
  const friendship = await db.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: profileId, addresseeId: otherProfileId },
        { requesterId: otherProfileId, addresseeId: profileId },
      ],
    },
    select: { id: true },
  });

  return Boolean(friendship);
};
