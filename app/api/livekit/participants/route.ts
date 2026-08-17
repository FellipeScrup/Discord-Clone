import { RoomServiceClient } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { ChannelType } from "@prisma/client";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function GET(req: NextRequest) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serverId = req.nextUrl.searchParams.get("serverId");

    if (!serverId) {
      return NextResponse.json({ error: "Server ID missing" }, { status: 400 });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: { some: { profileId: profile.id } },
      },
      include: {
        channels: {
          where: { type: { in: [ChannelType.AUDIO, ChannelType.VIDEO] } },
          select: { id: true },
        },
        members: {
          select: {
            profile: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
      },
    });

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ channels: {} });
    }

    const httpUrl = wsUrl.replace(/^ws/, "http");
    const client = new RoomServiceClient(httpUrl, apiKey, apiSecret);

    const profilesById = new Map(
      server.members.map((member) => [member.profile.id, member.profile])
    );

    const entries = await Promise.all(
      server.channels.map(async (channel) => {
        try {
          const participants = await client.listParticipants(channel.id);

          return [
            channel.id,
            participants.map((participant) => {
              const known = profilesById.get(participant.identity);

              return {
                id: participant.identity,
                name: known?.name ?? participant.name ?? "Unknown",
                imageUrl: known?.imageUrl ?? null,
              };
            }),
          ] as const;
        } catch {
          return [channel.id, []] as const;
        }
      })
    );

    return NextResponse.json({ channels: Object.fromEntries(entries) });
  } catch (error) {
    console.log("[LIVEKIT_PARTICIPANTS_GET]", error);
    return NextResponse.json({ channels: {} });
  }
}
