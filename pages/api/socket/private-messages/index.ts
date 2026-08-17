import { NextApiRequest } from "next";

import { currentProfilePages } from "@/lib/current-profile-pages";
import { NextApiResponseServerIo } from "@/types";
import { db } from "@/lib/db";
import { friendProfileSelect } from "@/lib/friends";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { conversationId } = req.query;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation Id Missing" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content Missing" });
    }

    const conversation = await db.directConversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [{ profileOneId: profile.id }, { profileTwoId: profile.id }],
      },
      select: { id: true },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const message = await db.privateMessage.create({
      data: {
        content,
        fileUrl,
        conversationId: conversation.id,
        profileId: profile.id,
      },
      include: { profile: { select: friendProfileSelect } },
    });

    res?.socket?.server?.io?.emit(`chat:${conversation.id}:messages`, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[PRIVATE_MESSAGES_POST]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
