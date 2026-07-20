import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  const isGuestRoute = pathname.startsWith("/account") || pathname.startsWith("/bookings");
  const isStaffRoute = pathname.startsWith("/dashboard");

  if (!sessionCookie && (isGuestRoute || isStaffRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/bookings/:path*", "/dashboard/:path*"],
};