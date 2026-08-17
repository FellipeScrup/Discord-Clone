import { NextApiRequest } from "next";

import { currentProfilePages } from "@/lib/current-profile-pages";
import { NextApiResponseServerIo } from "@/types";
import { db } from "@/lib/db";
import { friendProfileSelect } from "@/lib/friends";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const profile = await currentProfilePages(req);
    const { messageId, conversationId } = req.query;
    const { content } = req.body;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation Id Missing" });
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

    const message = await db.privateMessage.findFirst({
      where: {
        id: messageId as string,
        conversationId: conversation.id,
      },
    });

    if (!message || message.deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.profileId !== profile.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updated =
      req.method === "DELETE"
        ? await db.privateMessage.update({
            where: { id: message.id },
            data: {
              fileUrl: null,
              content: "This message has been deleted.",
              deleted: true,
            },
            include: { profile: { select: friendProfileSelect } },
          })
        : await db.privateMessage.update({
            where: { id: message.id },
            data: { content },
            include: { profile: { select: friendProfileSelect } },
          });

    res?.socket?.server?.io?.emit(
      `chat:${conversation.id}:messages:update`,
      updated
    );

    return res.status(200).json(updated);
  } catch (error) {
    console.log("[PRIVATE_MESSAGE_ID]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
