import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth-token";

const publicExact = new Set(["/sign-in", "/sign-up"]);
const publicPrefixes = ["/api/auth/login", "/api/auth/register"];

const isPublicPath = (pathname: string) => {
  if (publicExact.has(pathname)) {
    return true;
  }

  return publicPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      isAuthenticated = Boolean(await verifyAuthToken(token));
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated && !isPublicPath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && publicExact.has(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
