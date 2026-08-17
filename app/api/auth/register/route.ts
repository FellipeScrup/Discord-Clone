import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/lib/db";
import {
  applySessionCookie,
  defaultAvatarUrl,
  hashPassword,
} from "@/lib/auth";
import {
  USERNAME_RULES,
  isValidUsername,
  normalizeUsername,
} from "@/lib/username";

export async function POST(req: Request) {
  try {
    const { name, username, email, password } = await req.json();

    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const normalizedUsername = normalizeUsername(username);

    if (!trimmedName || !trimmedEmail || password.length < 6) {
      return NextResponse.json(
        { error: "Name, email and a password with at least 6 characters are required." },
        { status: 400 }
      );
    }

    if (!isValidUsername(normalizedUsername)) {
      return NextResponse.json({ error: USERNAME_RULES }, { status: 400 });
    }

    const existing = await db.profile.findFirst({
      where: {
        OR: [{ email: trimmedEmail }, { username: normalizedUsername }],
      },
      select: { email: true, username: true },
    });

    if (existing?.email === trimmedEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "This username is already taken." },
        { status: 409 }
      );
    }

    const userId = uuidv4();
    const hashedPassword = await hashPassword(password);

    await db.profile.create({
      data: {
        userId,
        name: trimmedName,
        username: normalizedUsername,
        email: trimmedEmail,
        password: hashedPassword,
        imageUrl: defaultAvatarUrl(trimmedName),
      },
    });

    const response = NextResponse.json({ ok: true });
    return applySessionCookie(response, userId);
  } catch (error) {
    console.log("[REGISTER]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
