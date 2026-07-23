import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/community/ask", "/insights/new", "/profile"];

export function middleware(request: NextRequest) {
  const isProtected = PROTECTED_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.has("accessToken");
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/community/ask", "/insights/new", "/profile"],
};