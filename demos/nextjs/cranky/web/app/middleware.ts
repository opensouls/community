import { NextResponse } from "next/server";

export function middleware() {
  const { CORS_RESTRICT_ORIGIN } = process.env;

  if (!CORS_RESTRICT_ORIGIN) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  response.headers.set("Access-Control-Allow-Origin", CORS_RESTRICT_ORIGIN);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Access-Control-Allow-Credentials", "false");

  return response;
}

export const config = {
  matcher: "/:path*",
};
