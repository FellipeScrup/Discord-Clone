import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE = "auth_session";

export const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
};

export const signAuthToken = async (userId: string) => {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAuthSecret());
};

export const verifyAuthToken = async (token: string) => {
  const { payload } = await jwtVerify(token, getAuthSecret());
  return typeof payload.userId === "string" ? payload.userId : null;
};
