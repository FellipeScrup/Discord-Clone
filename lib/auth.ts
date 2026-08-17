import { cookies } from "next/headers";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import {
  AUTH_COOKIE,
  signAuthToken,
  verifyAuthToken,
} from "@/lib/auth-token";

export { AUTH_COOKIE, signAuthToken, verifyAuthToken };

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const applySessionCookie = async (
  response: NextResponse,
  userId: string
) => {
  const token = await signAuthToken(userId);
  response.cookies.set(AUTH_COOKIE, token, COOKIE_OPTIONS);
  return response;
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set(AUTH_COOKIE, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
};

export const getSessionUserId = async () => {
  const token = cookies().get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyAuthToken(token);
  } catch {
    return null;
  }
};

export const getSessionUserIdFromRequest = async (req: NextApiRequest) => {
  const token = req.cookies[AUTH_COOKIE];

  if (!token) {
    return null;
  }

  try {
    return await verifyAuthToken(token);
  } catch {
    return null;
  }
};

export const defaultAvatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=5865F2&color=fff`;
