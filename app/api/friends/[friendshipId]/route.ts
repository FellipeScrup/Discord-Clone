import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

interface Params {
  params: { friendshipId: string };
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendship = await db.friendship.findFirst({
      where: {
        id: params.friendshipId,
        addresseeId: profile.id,
        status: "PENDING",
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friend request not found." },
        { status: 404 }
      );
    }

    const accepted = await db.friendship.update({
      where: { id: friendship.id },
      data: { status: "ACCEPTED" },
    });

    return NextResponse.json(accepted);
  } catch (error) {
    console.log("[FRIENDS_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendship = await db.friendship.findFirst({
      where: {
        id: params.friendshipId,
        OR: [{ requesterId: profile.id }, { addresseeId: profile.id }],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friendship not found." },
        { status: 404 }
      );
    }

    await db.friendship.delete({ where: { id: friendship.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log("[FRIENDS_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
