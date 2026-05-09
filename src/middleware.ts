import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const rootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim().toLowerCase() || "localhost";
  const hostname = request.nextUrl.hostname.toLowerCase();
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const isStoreSubdomain =
    rootDomain !== "localhost" &&
    hostname !== rootDomain &&
    hostname.endsWith(`.${rootDomain}`);

  if (!refreshToken && !isStoreSubdomain) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/tiendas/:path*"],
};
