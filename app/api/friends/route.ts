import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { getFriendshipsForProfile } from "@/lib/friends";
import { normalizeUsername } from "@/lib/username";

export async function GET() {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(await getFriendshipsForProfile(profile.id));
  } catch (error) {
    console.log("[FRIENDS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();

    if (typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 }
      );
    }

    const normalizedUsername = normalizeUsername(username);

    if (normalizedUsername === profile.username) {
      return NextResponse.json(
        { error: "You cannot add yourself." },
        { status: 400 }
      );
    }

    const target = await db.profile.findUnique({
      where: { username: normalizedUsername },
      select: { id: true, name: true, username: true },
    });

    if (!target) {
      return NextResponse.json(
        { error: "No user found with that username." },
        { status: 404 }
      );
    }

    const existing = await db.friendship.findFirst({
      where: {
        OR: [
          { requesterId: profile.id, addresseeId: target.id },
          { requesterId: target.id, addresseeId: profile.id },
        ],
      },
    });

    if (existing?.status === "ACCEPTED") {
      return NextResponse.json(
        { error: `You and ${target.name} are already friends.` },
        { status: 409 }
      );
    }

    if (existing?.requesterId === profile.id) {
      return NextResponse.json(
        { error: "You already sent a request to this user." },
        { status: 409 }
      );
    }

    if (existing) {
      const accepted = await db.friendship.update({
        where: { id: existing.id },
        data: { status: "ACCEPTED" },
      });

      return NextResponse.json({ friendship: accepted, accepted: true });
    }

    const friendship = await db.friendship.create({
      data: {
        requesterId: profile.id,
        addresseeId: target.id,
      },
    });

    return NextResponse.json({ friendship, accepted: false });
  } catch (error) {
    console.log("[FRIENDS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
