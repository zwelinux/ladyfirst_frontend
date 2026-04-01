import { NextResponse } from "next/server";

const AUTH_COOKIE_KEY = "ladyfirst_access";

const PUBLIC_PATHS = new Set(["/login"]);

function isPublicPath(pathname) {
  return PUBLIC_PATHS.has(pathname);
}

function isLocalDevHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".netlify.app")
  );
}

export function middleware(request) {
  const { pathname, hostname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Local development often runs the frontend on localhost and the backend on a
  // different domain, so backend auth cookies are not visible to this host.
  // Skip middleware auth redirects there and let the client auth flow handle it.
  if (isLocalDevHost(hostname)) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(AUTH_COOKIE_KEY)?.value;
  const isAuthenticated = Boolean(authCookie);
  const isPublic = isPublicPath(pathname);

  if (!isAuthenticated && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isPublic) {
    const dashboardUrl = new URL("/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
