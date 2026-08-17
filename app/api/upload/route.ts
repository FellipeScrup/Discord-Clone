import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { getSessionUserId } from "@/lib/auth";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

const ALLOWED_BY_ENDPOINT: Record<string, string[]> = {
  serverImage: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  messageFile: Object.keys(EXTENSION_BY_TYPE),
};

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const endpoint = String(formData.get("endpoint") ?? "messageFile");
    const allowedTypes = ALLOWED_BY_ENDPOINT[endpoint];

    if (!allowedTypes) {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file sent" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is larger than 8MB" },
        { status: 413 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type || "unknown"} is not allowed` },
        { status: 415 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${randomUUID()}.${EXTENSION_BY_TYPE[file.type]}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.log("[UPLOAD]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
