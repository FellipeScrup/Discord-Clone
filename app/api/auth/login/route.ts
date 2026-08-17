import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { applySessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const profile = await db.profile.findUnique({
      where: { email: trimmedEmail },
      select: {
        userId: true,
        password: true,
      },
    });

    if (!profile || !(await verifyPassword(password, profile.password))) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    return applySessionCookie(response, profile.userId);
  } catch (error) {
    console.log("[LOGIN]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
