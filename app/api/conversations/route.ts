import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { areFriends } from "@/lib/friends";
import { getOrCreateDirectConversation } from "@/lib/direct-conversation";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = await req.json();

    if (typeof profileId !== "string" || !profileId) {
      return NextResponse.json(
        { error: "Profile ID is required." },
        { status: 400 }
      );
    }

    if (profileId === profile.id) {
      return NextResponse.json(
        { error: "You cannot message yourself." },
        { status: 400 }
      );
    }

    if (!(await areFriends(profile.id, profileId))) {
      return NextResponse.json(
        { error: "You can only message friends." },
        { status: 403 }
      );
    }

    const conversation = await getOrCreateDirectConversation(
      profile.id,
      profileId
    );

    if (!conversation) {
      return NextResponse.json(
        { error: "Could not open the conversation." },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: conversation.id });
  } catch (error) {
    console.log("[CONVERSATIONS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
