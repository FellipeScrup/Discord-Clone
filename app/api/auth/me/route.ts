import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";

export async function GET() {
  const profile = await currentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: profile.id,
    name: profile.name,
    imageUrl: profile.imageUrl,
    email: profile.email,
  });
}
